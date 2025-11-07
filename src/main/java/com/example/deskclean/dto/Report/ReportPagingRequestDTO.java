package com.example.deskclean.dto.Report;

import lombok.Data;
import lombok.Getter;

@Getter
public class ReportPagingRequestDTO {
    private int page;
    private String type;
}
