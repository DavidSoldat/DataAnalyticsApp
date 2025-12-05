package com.example.backend.service;

import com.example.backend.model.Dataset;
import com.example.backend.model.DatasetStatus;
import com.example.backend.model.FileMetadata;
import com.example.backend.model.User;
import com.example.backend.repository.DatasetRepository;
import com.example.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
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


import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

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

    public DatasetService(DatasetRepository datasetRepository, UserRepository userRepository) {
        this.datasetRepository = datasetRepository;
        this.userRepository = userRepository;
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

    public void deleteFile(String key) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
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

    // ======================== DATABASE OPERATIONS ========================

    /**
     * Create new dataset record in database
     */
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
        // 1. Upload to Backblaze
        String filePath = uploadFile(file, userId, file.getOriginalFilename());

        // 2. Determine file type
        String fileType = file.getOriginalFilename().toLowerCase().endsWith(".csv") ? "CSV" : "EXCEL";

        // 3. Create dataset record
        Dataset dataset = createDataset(
                userId,
                file.getOriginalFilename(),
                filePath,
                file.getSize(),
                fileType
        );

        // 4. Process dataset asynchronously (TODO: implement CSV/Excel parsing)
        processDatasetAsync(dataset.getId(), file);

        return dataset;
    }

    /**
     * Get dataset by ID and user ID (ensures user owns the dataset)
     */
    public Dataset getDatasetByIdAndUserId(Long datasetId, Long userId) {
        return datasetRepository.findByIdAndUserId(datasetId, userId)
                .orElse(null);
    }

    /**
     * Get all datasets for a user
     */
    public List<Dataset> getUserDatasets(Long userId) {
        return datasetRepository.findByUserIdOrderByUploadedAtDesc(userId);
    }

    /**
     * Delete dataset completely (from storage and database)
     */
    @Transactional
    public void deleteDatasetComplete(Long datasetId, String filePath) {
        // Delete from Backblaze
        deleteFile(filePath);

        // Delete from database
        datasetRepository.deleteById(datasetId);
    }

    /**
     * Process dataset asynchronously (analyze columns, generate stats)
     * TODO: Implement CSV/Excel parsing and column analysis
     */
    @Async
    public void processDatasetAsync(Long datasetId, MultipartFile file) {
        try {
            // TODO: Parse CSV/Excel file
            // TODO: Analyze columns (data types, statistics)
            // TODO: Save column metadata to database
            // TODO: Update dataset status to COMPLETED

            // For now, just mark as completed
            Dataset dataset = datasetRepository.findById(datasetId).orElse(null);
            if (dataset != null) {
                dataset.setStatus(DatasetStatus.COMPLETED);
                dataset.setTotalRows(100); // Placeholder
                dataset.setTotalColumns(5); // Placeholder
                datasetRepository.save(dataset);
            }
        } catch (Exception e) {
            // Mark dataset as failed
            Dataset dataset = datasetRepository.findById(datasetId).orElse(null);
            if (dataset != null) {
                dataset.setStatus(DatasetStatus.FAILED);
                datasetRepository.save(dataset);
            }
        }
    }
}