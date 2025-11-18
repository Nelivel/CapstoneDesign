package com.example.deskclean.dto.Report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportUserRequestDTO {

    private Long reportedUserId; // 신고할 사용자 ID

    private String report_type; // 신고 사유 선택

    private String comment; // 신고 상세 사유
}
