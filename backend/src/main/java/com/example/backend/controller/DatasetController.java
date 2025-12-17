package com.example.backend.controller;

import com.example.backend.dto.datasets.DatasetColumnResponse;
import com.example.backend.dto.datasets.DatasetResponse;
import com.example.backend.model.CustomUserDetails;
import com.example.backend.model.Dataset;
import com.example.backend.repository.DatasetColumnRepository;
import com.example.backend.service.DatasetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/datasets")
public class DatasetController {

    private final DatasetColumnRepository datasetColumnRepository;
    private final DatasetService datasetService;

    public DatasetController(DatasetColumnRepository datasetColumnRepository, DatasetService datasetService) {
        this.datasetColumnRepository = datasetColumnRepository;
        this.datasetService = datasetService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDataset(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        if (!isValidFileType(file.getOriginalFilename())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid file type. Only CSV and Excel files are allowed."));
        }

        if (file.getSize() > 50 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File size exceeds 50MB limit"));
        }

        Dataset dataset = datasetService.uploadAndCreateDataset(file, currentUser.getUserId());

        return ResponseEntity.ok(Map.of(
                "id", dataset.getId(),
                "name", dataset.getName(),
                "status", dataset.getStatus().toString(),
                "message", "File uploaded successfully and is being processed"
        ));
    }

    @GetMapping("/user")
    public ResponseEntity<List<DatasetResponse>> getUserDatasets(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        List<Dataset> datasets = datasetService.getUserDatasets(currentUser.getUserId());

        List<DatasetResponse> response = datasets.stream()
                .map(DatasetResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDataset(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Dataset dataset = datasetService.getDatasetByIdAndUserId(id, currentUser.getUserId());

        if (dataset == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(DatasetResponse.from(dataset));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> getDownloadUrl(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Dataset dataset = datasetService.getDatasetByIdAndUserId(id, currentUser.getUserId());

        if (dataset == null) {
            return ResponseEntity.notFound().build();
        }

        String downloadUrl = datasetService.generatePresignedUrl(dataset.getFilePath());

        return ResponseEntity.ok(Map.of(
                "downloadUrl", downloadUrl,
                "filename", dataset.getName()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDataset(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Dataset dataset = datasetService.getDatasetByIdAndUserId(id, currentUser.getUserId());

        if (dataset == null) {
            return ResponseEntity.notFound().build();
        }

        datasetService.deleteDatasetComplete(id, dataset.getFilePath());

        return ResponseEntity.ok(Map.of("message", "Dataset deleted successfully"));
    }

    private boolean isValidFileType(String filename) {
        if (filename == null) return false;
        String lower = filename.toLowerCase();
        return lower.endsWith(".csv") || lower.endsWith(".xlsx") || lower.endsWith(".xls");
    }

    @GetMapping("/{id}/columns")
    public ResponseEntity<?> getDatasetColumns(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Dataset dataset = datasetService.getDatasetByIdAndUserId(id, currentUser.getUserId());

        if (dataset == null) {
            return ResponseEntity.notFound().build();
        }

        List<DatasetColumnResponse> columns = dataset.getColumns().stream()
                .map(DatasetColumnResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(columns);
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<?> getDataPreview(
            @PathVariable Long id,
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Dataset dataset = datasetService.getDatasetByIdAndUserId(id, currentUser.getUserId());

        if (dataset == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            List<Map<String, Object>> preview = datasetService.getDataPreview(
                    dataset.getFilePath(),
                    limit
            );
            return ResponseEntity.ok(preview);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to load data preview"));
        }
    }
}