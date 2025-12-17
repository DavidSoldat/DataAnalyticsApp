package com.example.backend.service;

import com.example.backend.model.Dataset;
import com.example.backend.model.DatasetStatus;
import com.example.backend.model.FileMetadata;
import com.example.backend.model.User;
import com.example.backend.repository.DatasetRepository;
import com.example.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.ILoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;


import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URI;
import java.time.Duration;
import java.util.*;

@Service
public class DatasetService {

    @Value("${backblaze.endpoint}")
    private String endpoint;

    @Value("${backblaze.key-id}")
    private String keyId;

    @Value("${backblaze.application-key}")
    private String applicationKey;

    @Value("${backblaze.bucket-name}")
    private String bucketName;

    @Value("${backblaze.region}")
    private String region;

    private S3Client s3Client;
    private S3Presigner presigner;

    private final DatasetRepository datasetRepository;
    private final UserRepository userRepository;
    private final DatasetProcessingService datasetProcessingService;

    public DatasetService(DatasetRepository datasetRepository, UserRepository userRepository, DatasetProcessingService datasetProcessingService) {
        this.datasetRepository = datasetRepository;
        this.userRepository = userRepository;
        this.datasetProcessingService = datasetProcessingService;
    }

    @PostConstruct
    public void init() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(keyId, applicationKey);

        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of(region))
                .build();

        this.presigner = S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of(region))
                .build();
    }


    public String uploadFile(MultipartFile file, Long userId, String originalFilename) throws IOException {
        String filename = UUID.randomUUID() + "_" + originalFilename;
        String key = userId + "/" + filename;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

        return key;
    }

    public byte[] downloadFile(String key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        return s3Client.getObjectAsBytes(getObjectRequest).asByteArray();
    }

    public String generatePresignedUrl(String key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(1))
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
        return presignedRequest.url().toString();
    }

    public void deleteFile(String filePath) {
        String key = filePath.replaceAll("^/+", "");

        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

        } catch (Exception e) {
            System.out.println("deleteFile() ERROR:");
        }
    }

    public boolean fileExists(String key) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.headObject(headObjectRequest);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        }
    }

    public FileMetadata getFileMetadata(String key) {
        HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        HeadObjectResponse response = s3Client.headObject(headObjectRequest);

        return FileMetadata.builder()
                .key(key)
                .size(response.contentLength())
                .contentType(response.contentType())
                .lastModified(response.lastModified())
                .build();
    }

    public List<String> listUserFiles(Long userId) {
        String prefix = userId + "/";

        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(bucketName)
                .prefix(prefix)
                .build();

        ListObjectsV2Response response = s3Client.listObjectsV2(listRequest);

        return response.contents().stream()
                .map(S3Object::key)
                .collect(java.util.stream.Collectors.toList());
    }


    @Transactional
    public Dataset createDataset(Long userId, String originalFilename,
                                 String filePath, Long fileSize, String fileType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Dataset dataset = new Dataset();
        dataset.setUser(user);
        dataset.setName(originalFilename);
        dataset.setFilePath(filePath);
        dataset.setFileSize(fileSize);
        dataset.setFileType(fileType);
        dataset.setStatus(DatasetStatus.PROCESSING);
        dataset.setTotalRows(0);
        dataset.setTotalColumns(0);

        return datasetRepository.save(dataset);
    }

    @Transactional
    public Dataset uploadAndCreateDataset(MultipartFile file, Long userId) throws IOException {

        String filePath = uploadFile(file, userId, file.getOriginalFilename());

        String fileType = file.getOriginalFilename().toLowerCase().endsWith(".csv") ? "CSV" : "EXCEL";

        Dataset dataset = createDataset(
                userId,
                file.getOriginalFilename(),
                filePath,
                file.getSize(),
                fileType
        );

        processDatasetAsync(dataset.getId(), file);

        return dataset;
    }

    public Dataset getDatasetByIdAndUserId(Long datasetId, Long userId) {
        return datasetRepository.findByIdAndUserId(datasetId, userId)
                .orElse(null);
    }

List<Dataset> getUserDatasets(Long userId) {
        return datasetRepository.findByUserIdOrderByUploadedAtDesc(userId);
    }


    @Transactional
    public void deleteDatasetComplete(Long datasetId, String filePath) {
        try {
            deleteFile(filePath);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file from storage", e);
        }
        datasetRepository.deleteById(datasetId);
    }


    @Async
    public void processDatasetAsync(Long datasetId, MultipartFile file) {
        try {
            datasetProcessingService.processDataset(datasetId, file);
        } catch (Exception e) {
            Dataset dataset = datasetRepository.findById(datasetId).orElse(null);
            if (dataset != null) {
                dataset.setStatus(DatasetStatus.FAILED);
                datasetRepository.save(dataset);
            }
        }
    }

    public List<Map<String, Object>> getDataPreview(String filePath, int limit) throws IOException {

        byte[] fileBytes = downloadFile(filePath);

        String fileName = filePath.toLowerCase();

        if (fileName.endsWith(".csv")) {
            return getCSVPreview(fileBytes, limit);
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
            return getExcelPreview(fileBytes, fileName, limit);
        }

        throw new RuntimeException("Unsupported file type");
    }

    private List<Map<String, Object>> getCSVPreview(byte[] fileBytes, int limit) throws IOException {
        List<Map<String, Object>> result = new ArrayList<>();

        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .build();

        try (Reader reader = new InputStreamReader(new ByteArrayInputStream(fileBytes));
             CSVParser csvParser = new CSVParser(reader,format)) {

            List<String> headers = new ArrayList<>(csvParser.getHeaderMap().keySet());
            int count = 0;

            for (CSVRecord record : csvParser) {
                if (count >= limit) break;

                Map<String, Object> row = new LinkedHashMap<>();
                for (String header : headers) {
                    row.put(header, record.get(header));
                }
                result.add(row);
                count++;
            }
        }

        return result;
    }

    private List<Map<String, Object>> getExcelPreview(byte[] fileBytes, String fileName, int limit) throws IOException {
        List<Map<String, Object>> result = new ArrayList<>();

        try (Workbook workbook = fileName.endsWith(".xlsx")
                ? new XSSFWorkbook(new ByteArrayInputStream(fileBytes))
                : new HSSFWorkbook(new ByteArrayInputStream(fileBytes))) {

            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);

            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(getCellValueAsString(cell));
            }

            int count = 0;
            for (int i = 1; i <= sheet.getLastRowNum() && count < limit; i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Map<String, Object> rowMap = new LinkedHashMap<>();
                for (int j = 0; j < headers.size(); j++) {
                    Cell cell = row.getCell(j);
                    rowMap.put(headers.get(j), cell == null ? "" : getCellValueAsString(cell));
                }
                result.add(rowMap);
                count++;
            }
        }

        return result;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
}