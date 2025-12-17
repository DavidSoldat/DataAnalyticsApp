package com.example.backend.dto.datasets;


import com.example.backend.model.ColumnType;
import com.example.backend.model.DatasetColumn;
import lombok.Data;

@Data
public class DatasetColumnResponse {
    private Long id;
    private String columnName;
    private Integer columnIndex;
    private ColumnType dataType;
    private Integer uniqueValues;
    private Integer nullCount;
    private Double mean;
    private Double median;
    private Double stdDev;
    private Double minValue;
    private Double maxValue;

    public static DatasetColumnResponse from(DatasetColumn column) {
        DatasetColumnResponse response = new DatasetColumnResponse();
        response.setId(column.getId());
        response.setColumnName(column.getColumnName());
        response.setColumnIndex(column.getColumnIndex());
        response.setDataType(column.getDataType());
        response.setUniqueValues(column.getUniqueValues());
        response.setNullCount(column.getNullCount());
        response.setMean(column.getMean());
        response.setMedian(column.getMedian());
        response.setStdDev(column.getStdDev());
        response.setMinValue(column.getMinValue());
        response.setMaxValue(column.getMaxValue());
        return response;
    }
}