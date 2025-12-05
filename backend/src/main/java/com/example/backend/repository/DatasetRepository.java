package com.example.backend.repository;

import com.example.backend.model.Dataset;
import com.example.backend.model.DatasetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DatasetRepository extends JpaRepository<Dataset, Long> {

    Optional<Dataset> findByIdAndUserId(Long id, Long userId);

    List<Dataset> findByUserIdOrderByUploadedAtDesc(Long userId);

    List<Dataset> findByUserId(Long userId);

    long countByUserId(Long userId);

    List<Dataset> findByUserIdAndStatus(Long userId, DatasetStatus status);
}
