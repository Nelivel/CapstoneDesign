package com.example.deskclean.dto.Report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportMessageRequestDTO {

    private Long message_id; // 신고할 메시지 ID

    private String report_type; // 신고 사유 선택

    private String comment; // 신고 상세 사유
}
