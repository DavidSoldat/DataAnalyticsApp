package com.example.backend.model;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class FileMetadata {
    private String key;
    private Long size;
    private String contentType;
    private Instant lastModified;
}