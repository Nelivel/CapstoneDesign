package com.example.deskclean.dto.Report;

import com.example.deskclean.domain.Enum.ReportStatus;
import com.example.deskclean.domain.Enum.ReportType;
import lombok.*;

// 신고_댓글_매핑
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportReplyResponseDTO {

    private Long report_id; // 신고 id

    private String reporter_nickname; // 신고자 닉네임

    private Long reply_id; // 신고당한 댓글 아이디

    private String reply_content; // 신고당한 댓글 내용

    private String reply_author_nickname; // 댓글 작성자 닉네임

    private ReportType report_type; // 신고 사유

    private String comment; // 신고 상세 사유

    private ReportStatus status; // 신고 처리 상태
}
