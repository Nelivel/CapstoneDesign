package com.example.deskclean.dto.Report;

import com.example.deskclean.domain.Enum.ReportStatus;
import com.example.deskclean.domain.Enum.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportProductResponseDTO {

    private Long report_id; // 신고 ID
    private String reporter_nickname; // 신고자 닉네임
    private Long product_id; // 신고된 상품 ID
    private String product_name; // 신고된 상품 이름
    private String seller_nickname; // 판매자 닉네임
    private ReportType report_type; // 신고 사유
    private String comment; // 신고 상세 사유
    private ReportStatus status; // 신고 처리 상태
}
