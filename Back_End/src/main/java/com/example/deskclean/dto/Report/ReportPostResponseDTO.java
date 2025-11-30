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
public class ReportPostResponseDTO {

    private Long report_id; // 신고 id

    private String reporter_nickname; // 신고자 닉네임

    private Long post_id; // 신고당한 게시글 아이디

    private String post_title; // 신고당한 게시글 제목

    private String post_content; // 신고당한 게시글 내용

    private String post_author_nickname; // 게시글 작성자 닉네임

    private ReportType report_type; // 신고 사유

    private String comment; // 신고 상세 사유

    private ReportStatus status; // 신고 처리 상태
}
