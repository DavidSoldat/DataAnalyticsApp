package com.example.backend.service;


import com.example.backend.model.ColumnType;
import com.example.backend.model.Dataset;
import com.example.backend.model.DatasetColumn;
import com.example.backend.model.DatasetStatus;
import com.example.backend.repository.DatasetColumnRepository;
import com.example.backend.repository.DatasetRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DatasetProcessingService {

    private final DatasetRepository datasetRepository;
    private final DatasetColumnRepository datasetColumnRepository;

    public DatasetProcessingService(DatasetRepository datasetRepository, DatasetColumnRepository datasetColumnRepository) {
        this.datasetRepository = datasetRepository;
        this.datasetColumnRepository = datasetColumnRepository;
    }

    /**
     * Process uploaded dataset - parse file and analyze columns
     */
    public void processDataset(Long datasetId, MultipartFile file) throws Exception {
        Dataset dataset = datasetRepository.findById(datasetId)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));

        String fileName = file.getOriginalFilename();

        if (fileName.toLowerCase().endsWith(".csv")) {
            processCSV(dataset, file);
        } else if (fileName.toLowerCase().endsWith(".xlsx") || fileName.toLowerCase().endsWith(".xls")) {
            processExcel(dataset, file);
        } else {
            throw new RuntimeException("Unsupported file format");
        }

        dataset.setStatus(DatasetStatus.COMPLETED);
        datasetRepository.save(dataset);
    }

    /**
     * Process CSV file
     */
    private void processCSV(Dataset dataset, MultipartFile file) throws IOException {
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                     .withFirstRecordAsHeader()
                     .withIgnoreHeaderCase()
                     .withTrim())) {

            List<CSVRecord> records = csvParser.getRecords();
            Map<String, Integer> headers = csvParser.getHeaderMap();

            if (records.isEmpty()) {
                throw new RuntimeException("CSV file is empty");
            }

            // Update dataset with row and column counts
            dataset.setTotalRows(records.size());
            dataset.setTotalColumns(headers.size());

            // Analyze each column
            List<DatasetColumn> columns = new ArrayList<>();
            int columnIndex = 0;

            for (String columnName : headers.keySet()) {
                DatasetColumn column = analyzeColumn(dataset, columnName, columnIndex, records);
                columns.add(column);
                columnIndex++;
            }

            // Save all columns
            datasetColumnRepository.saveAll(columns);
        }
    }

    /**
     * Process Excel file
     */
    private void processExcel(Dataset dataset, MultipartFile file) throws IOException {
        Workbook workbook = null;

        try {
            if (file.getOriginalFilename().toLowerCase().endsWith(".xlsx")) {
                workbook = new XSSFWorkbook(file.getInputStream());
            } else {
                workbook = new HSSFWorkbook(file.getInputStream());
            }

            Sheet sheet = workbook.getSheetAt(0); // Read first sheet

            if (sheet.getPhysicalNumberOfRows() < 2) {
                throw new RuntimeException("Excel file must have at least a header row and one data row");
            }

            // Get headers from first row
            Row headerRow = sheet.getRow(0);
            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(getCellValueAsString(cell));
            }

            // Read all data rows
            List<List<String>> rows = new ArrayList<>();
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                List<String> rowData = new ArrayList<>();
                for (int j = 0; j < headers.size(); j++) {
                    Cell cell = row.getCell(j);
                    rowData.add(cell == null ? "" : getCellValueAsString(cell));
                }
                rows.add(rowData);
            }

            // Update dataset
            dataset.setTotalRows(rows.size());
            dataset.setTotalColumns(headers.size());

            // Analyze each column
            List<DatasetColumn> columns = new ArrayList<>();
            for (int i = 0; i < headers.size(); i++) {
                DatasetColumn column = analyzeExcelColumn(dataset, headers.get(i), i, rows, i);
                columns.add(column);
            }

            // Save all columns
            datasetColumnRepository.saveAll(columns);

        } finally {
            if (workbook != null) {
                workbook.close();
            }
        }
    }

    /**
     * Analyze a CSV column
     */
    private DatasetColumn analyzeColumn(Dataset dataset, String columnName, int columnIndex, List<CSVRecord> records) {
        List<String> values = records.stream()
                .map(record -> record.get(columnName))
                .collect(Collectors.toList());

        return analyzeColumnData(dataset, columnName, columnIndex, values);
    }

    /**
     * Analyze an Excel column
     */
    private DatasetColumn analyzeExcelColumn(Dataset dataset, String columnName, int columnIndex,
                                             List<List<String>> rows, int colIdx) {
        List<String> values = rows.stream()
                .map(row -> row.get(colIdx))
                .collect(Collectors.toList());

        return analyzeColumnData(dataset, columnName, columnIndex, values);
    }

    /**
     * Analyze column data and generate statistics
     */
    private DatasetColumn analyzeColumnData(Dataset dataset, String columnName, int columnIndex, List<String> values) {
        DatasetColumn column = new DatasetColumn();
        column.setDataset(dataset);
        column.setColumnName(columnName);
        column.setColumnIndex(columnIndex);

        // Count nulls/empty values
        long nullCount = values.stream()
                .filter(v -> v == null || v.trim().isEmpty())
                .count();
        column.setNullCount((int) nullCount);

        // Get non-null values
        List<String> nonNullValues = values.stream()
                .filter(v -> v != null && !v.trim().isEmpty())
                .collect(Collectors.toList());

        // Count unique values
        Set<String> uniqueValues = new HashSet<>(nonNullValues);
        column.setUniqueValues(uniqueValues.size());

        // Determine data type and calculate statistics
        ColumnType dataType = determineDataType(nonNullValues);
        column.setDataType(dataType);

        if (dataType == ColumnType.NUMERIC && !nonNullValues.isEmpty()) {
            calculateNumericStats(column, nonNullValues);
        }

        return column;
    }

    /**
     * Determine column data type
     */
    private ColumnType determineDataType(List<String> values) {
        if (values.isEmpty()) {
            return ColumnType.TEXT;
        }

        // Sample first 100 values for type detection
        List<String> sample = values.stream()
                .limit(100)
                .collect(Collectors.toList());

        long numericCount = sample.stream()
                .filter(this::isNumeric)
                .count();

        long dateCount = sample.stream()
                .filter(this::isDate)
                .count();

        long booleanCount = sample.stream()
                .filter(this::isBoolean)
                .count();

        double numericRatio = (double) numericCount / sample.size();
        double dateRatio = (double) dateCount / sample.size();
        double booleanRatio = (double) booleanCount / sample.size();

        // At least 80% match to be considered that type
        if (numericRatio >= 0.8) {
            return ColumnType.NUMERIC;
        } else if (dateRatio >= 0.8) {
            return ColumnType.DATE;
        } else if (booleanRatio >= 0.8) {
            return ColumnType.BOOLEAN;
        } else {
            return ColumnType.TEXT;
        }
    }

    /**
     * Calculate numeric statistics (mean, median, min, max, stddev)
     */
    private void calculateNumericStats(DatasetColumn column, List<String> values) {
        List<Double> numbers = values.stream()
                .filter(this::isNumeric)
                .map(Double::parseDouble)
                .sorted()
                .collect(Collectors.toList());

        if (numbers.isEmpty()) {
            return;
        }

        // Min and Max
        column.setMinValue(numbers.get(0));
        column.setMaxValue(numbers.get(numbers.size() - 1));

        // Mean
        double mean = numbers.stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
        mean = Math.round(mean * 100.0) / 100.0; // 2 decimals
        column.setMean(mean);

        // Median
        double median;
        int size = numbers.size();
        if (size % 2 == 0) {
            median = (numbers.get(size / 2 - 1) + numbers.get(size / 2)) / 2.0;
        } else {
            median = numbers.get(size / 2);
        }
        median = Math.round(median * 100.0) / 100.0; // 2 decimals
        column.setMedian(median);

        // Standard Deviation
        double finalMean = mean;
        double variance = numbers.stream()
                .mapToDouble(num -> Math.pow(num - finalMean, 2))
                .average()
                .orElse(0.0);
        double stdDev = Math.sqrt(variance);
        stdDev = Math.round(stdDev * 100.0) / 100.0; // 2 decimals
        column.setStdDev(stdDev);
    }
        /**
         * Check if string is numeric
         */
    private boolean isNumeric(String str) {
        if (str == null || str.trim().isEmpty()) {
            return false;
        }
        try {
            Double.parseDouble(str.trim());
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * Check if string is a date
     */
    private boolean isDate(String str) {
        if (str == null || str.trim().isEmpty()) {
            return false;
        }
        // Simple date pattern check (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, etc.)
        String datePattern = "^\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}$|^\\d{1,2}[-/]\\d{1,2}[-/]\\d{4}$";
        return str.trim().matches(datePattern);
    }

    /**
     * Check if string is boolean
     */
    private boolean isBoolean(String str) {
        if (str == null || str.trim().isEmpty()) {
            return false;
        }
        String lower = str.trim().toLowerCase();
        return lower.equals("true") || lower.equals("false") ||
                lower.equals("yes") || lower.equals("no") ||
                lower.equals("1") || lower.equals("0");
    }

    /**
     * Get Excel cell value as string
     */
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }

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
            case BLANK:
                return "";
            default:
                return "";
        }
    }
}