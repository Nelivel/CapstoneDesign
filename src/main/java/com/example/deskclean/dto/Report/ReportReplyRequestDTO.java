package com.example.deskclean.dto.Report;

import com.example.deskclean.domain.Enum.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 신고_댓글_매핑
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportReplyRequestDTO {

    private Long reply_id; // reply id

    private String report_type; // 신고 사유 선택 (enum값)

    private String comment; // 신고 상세 사유
}
