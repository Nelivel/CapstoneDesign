package com.example.deskclean.dto.Report;

import com.example.deskclean.domain.Report;
import lombok.Data;

@Data
public class ReportResponseDTO {
    private Long report_id;
    private String reporter_id;
    private String report_type;
    private String comment;
    private String status;

    // 신고 대상 정보
    private Long product_id;
    private Long reportedUserId;
    private Long message_id;
    private String content;

    public ReportResponseDTO(Report report) {
        this.report_id = report.getReport_id();
        this.reporter_id = String.valueOf(report.getReporter_id().getId());
        this.report_type = report.getReport_type().toString();
        this.comment = report.getComment();
        this.status = report.getStatus().toString();

        // 상품 신고
        if(report.getProduct_id() != null) {
            this.product_id = report.getProduct_id().getId();
            this.content = report.getProduct_id().getTitle();
        }
        // 사용자 신고
        if(report.getReported_user_id() != null) {
            this.reportedUserId = report.getReported_user_id().getId();
            this.content = report.getReported_user_id().getNickname();
        }
        // 메시지 신고
        if(report.getMessage_id() != null) {
            this.message_id = report.getMessage_id().getId();
            this.content = report.getMessage_id().getContent();
        }
    }
}
