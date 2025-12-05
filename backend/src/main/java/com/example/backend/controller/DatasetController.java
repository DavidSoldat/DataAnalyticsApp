package com.example.backend.controller;

import com.example.backend.model.CustomUserDetails;
import com.example.backend.model.Dataset;
import com.example.backend.service.DatasetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/datasets")
public class DatasetController {

    @Autowired
    private DatasetService datasetService;

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

        // Upload and create dataset
        Dataset dataset = datasetService.uploadAndCreateDataset(file, currentUser.getUserId());

        return ResponseEntity.ok(Map.of(
                "id", dataset.getId(),
                "name", dataset.getName(),
                "status", dataset.getStatus().toString(),
                "message", "File uploaded successfully and is being processed"
        ));
    }

    @GetMapping("/user")
    public ResponseEntity<List<Dataset>> getUserDatasets(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        List<Dataset> datasets = datasetService.getUserDatasets(currentUser.getUserId());
        return ResponseEntity.ok(datasets);
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

        return ResponseEntity.ok(dataset);
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
}