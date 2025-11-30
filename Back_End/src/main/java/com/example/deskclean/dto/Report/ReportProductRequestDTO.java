package com.example.deskclean.dto.Report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportProductRequestDTO {

    private Long product_id; // 신고할 상품 ID

    private String report_type; // 신고 사유 선택

    private String comment; // 신고 상세 사유
}
