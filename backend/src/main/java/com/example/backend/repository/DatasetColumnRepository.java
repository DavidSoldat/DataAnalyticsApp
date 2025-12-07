package com.example.backend.repository;


import com.example.backend.model.DatasetColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DatasetColumnRepository extends JpaRepository<DatasetColumn, Long> {

    List<DatasetColumn> findByDatasetIdOrderByColumnIndex(Long datasetId);

    void deleteByDatasetId(Long datasetId);
}