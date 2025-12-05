package com.example.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;


@Entity
@Table(name = "dataset_columns")
public class DatasetColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dataset_id", nullable = false)
    private Dataset dataset;

    @Column(nullable = false)
    private String columnName;

    @Column(nullable = false)
    private Integer columnIndex;  // Position in the dataset (0, 1, 2...)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ColumnType dataType;  // NUMERIC, TEXT, DATE, BOOLEAN

    @Column(nullable = false)
    private Integer uniqueValues;

    @Column(nullable = false)
    private Integer nullCount;

    private Double mean;
    private Double median;
    private Double stdDev;
    private Double minValue;
    private Double maxValue;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

