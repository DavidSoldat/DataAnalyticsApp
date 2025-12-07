package com.example.backend.dto;

import com.example.backend.model.Dataset;
import com.example.backend.model.DatasetStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DatasetResponse {
    private Long id;
    private String name;
    private String fileType;
    private Long fileSize;
    private Integer totalRows;
    private Integer totalColumns;
    private DatasetStatus status;
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;

    public static DatasetResponse from(Dataset dataset) {
        DatasetResponse response = new DatasetResponse();
        response.setId(dataset.getId());
        response.setName(dataset.getName());
        response.setFileType(dataset.getFileType());
        response.setFileSize(dataset.getFileSize());
        response.setTotalRows(dataset.getTotalRows());
        response.setTotalColumns(dataset.getTotalColumns());
        response.setStatus(dataset.getStatus());
        response.setUploadedAt(dataset.getUploadedAt());
        response.setUpdatedAt(dataset.getUpdatedAt());
        return response;
    }
}