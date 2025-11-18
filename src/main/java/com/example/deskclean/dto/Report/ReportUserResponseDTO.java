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
public class ReportUserResponseDTO {

    private Long report_id; // 신고 ID
    private String reporter_nickname; // 신고자 닉네임
    private Long reportedUserId; // 신고된 사용자 ID
    private String reported_user_nickname; // 신고된 사용자 닉네임
    private ReportType report_type; // 신고 사유
    private String comment; // 신고 상세 사유
    private ReportStatus status; // 신고 처리 상태
}
