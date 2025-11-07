package com.example.deskclean.service;

import com.example.deskclean.domain.*;
import com.example.deskclean.domain.Enum.ReportStatus;
import com.example.deskclean.domain.Enum.ReportType;
import com.example.deskclean.dto.Report.*;
import com.example.deskclean.dto.paging.PageResponseDTO;
import com.example.deskclean.repository.PostRepository;
import com.example.deskclean.repository.ReplyRepository;
import com.example.deskclean.repository.ReportRepository;
import com.example.deskclean.repository.UserRepository;
import com.example.deskclean.util.EnumCastingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ReplyRepository replyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    EnumCastingUtil enumCastingUtil;

    // post 신고
    @Transactional
    public ReportPostResponseDTO createPostReport(Long reporter_id, ReportPostRequestDTO requestDTO) {

        // 신고자
        User reporter = userRepository.findById(reporter_id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reporter id: " + reporter_id));

        // 신고당한 post
        Post post = postRepository.findById(requestDTO.getPost_id())
                .orElseThrow(() -> new IllegalArgumentException("Invalid post id: " + requestDTO.getPost_id()));

        ReportType reportType = enumCastingUtil.castingReportType(requestDTO.getReport_type());

        // 신고 build
        Report report = Report.builder()
                .reporter_id(reporter) // 신고자 정보
                .report_type(reportType) // 신고 사유 선택
                .comment(requestDTO.getComment()) // 신고 상세 사유
                .status(ReportStatus.RECEIVED)
                .post_id(post)
                .build();

        reportRepository.save(report);

        return ReportPostResponseDTO.builder()
                .report_id(report.getReport_id())
                .reporter_nickname(report.getReporter_id().getNickname())
                .post_id(post.getPost_id())
                .post_title(post.getTitle())
                .post_content(post.getContent())
                .post_author_nickname(post.getAuthor().getNickname())
                .report_type(report.getReport_type())
                .comment(report.getComment())
                .status(report.getStatus())
                .build();
    }

    // 신고_댓글_매핑
    @Transactional
    public ReportReplyResponseDTO createReplyReport(Long reporter_id, ReportReplyRequestDTO requestDTO) {

        ReportType type = enumCastingUtil.castingReportType(requestDTO.getReport_type());

        // 신고자
        User reporter = userRepository.findById(reporter_id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reporter id: " + reporter_id));

        // 신고당한 reply
        Reply reply = replyRepository.findById(requestDTO.getReply_id())
                .orElseThrow(() -> new IllegalArgumentException("Invalid reply id: " + requestDTO.getReply_id()));

        // 신고 build
        Report report = Report.builder()
                .reporter_id(reporter)
                .report_type(type)
                .comment(requestDTO.getComment())
                .status(ReportStatus.RECEIVED)
                .reply_id(reply)
                .build();

        reportRepository.save(report);

        return ReportReplyResponseDTO.builder()
                .report_id(report.getReport_id())
                .reporter_nickname(report.getReporter_id().getNickname())
                .reply_id(reply.getReply_id())
                .reply_content(reply.getContent())
                .reply_author_nickname(reply.getAuthor().getNickname())
                .report_type(report.getReport_type())
                .comment(report.getComment())
                .status(report.getStatus())
                .build();
    }

    // 신고 처리 상태 변경
    @Transactional
    public void updateReportStatus(Long report_id, Long admin_id)
    {
        Report report = reportRepository.findById(report_id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid report id: " + report_id));

        User user = userRepository.findById(admin_id)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid admin id: " + admin_id));

        report.setStatus(ReportStatus.RESOLVED, user);

        reportRepository.save(report); // 변경된 상태 저장
    }

    @Transactional
    public PageResponseDTO reportPaging(ReportPagingRequestDTO pagingRequestDTO){
        int pageLimit = 10;
        int page = pagingRequestDTO.getPage();

        Page<Report> reportPage = null;

        if(pagingRequestDTO.getType().equalsIgnoreCase("reply")){
            reportPage = reportRepository.findAllReplyReport(ReportStatus.RECEIVED,PageRequest.of(page-1, pageLimit));

        }else if (pagingRequestDTO.getType().equalsIgnoreCase("post")){
            reportPage = reportRepository.findAllPostReport(ReportStatus.RECEIVED, PageRequest.of(page-1, pageLimit));
        }

        // 각 Post를 PostResponseDto로 변환합니다.
        Page<ReportResponseDTO> reportResponseDtos = reportPage.map(
                report -> new ReportResponseDTO(report));

        PageResponseDTO pages = new PageResponseDTO(reportResponseDtos);

        return pages;
    }

}
