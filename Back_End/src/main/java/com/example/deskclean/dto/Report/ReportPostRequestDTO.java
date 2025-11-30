package com.example.deskclean.dto.Report;

import com.example.deskclean.domain.Enum.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportPostRequestDTO {

    private Long post_id; // post id

    private String report_type; // 신고 사유 선택

    private String comment; // 신고 상세 사유
}
