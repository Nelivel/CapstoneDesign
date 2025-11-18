package com.example.deskclean.service;

import com.example.deskclean.domain.*;
import com.example.deskclean.domain.Enum.ReportStatus;
import com.example.deskclean.domain.Enum.ReportType;
import com.example.deskclean.dto.Report.*;
import com.example.deskclean.dto.paging.PageResponseDTO;
import com.example.deskclean.repository.*;
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
    private ProductRepository productRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    EnumCastingUtil enumCastingUtil;

    // ===== 새로운 신고 기능 =====

    // 상품 신고
    @Transactional
    public ReportProductResponseDTO createProductReport(Long reporter_id, ReportProductRequestDTO requestDTO) {
        // 신고자
        User reporter = userRepository.findById(reporter_id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reporter id: " + reporter_id));

        // 신고당한 상품
        Product product = productRepository.findById(requestDTO.getProduct_id())
                .orElseThrow(() -> new IllegalArgumentException("Invalid product id: " + requestDTO.getProduct_id()));

        ReportType reportType = enumCastingUtil.castingReportType(requestDTO.getReport_type());

        // 신고 build
        Report report = Report.builder()
                .reporter_id(reporter)
                .report_type(reportType)
                .comment(requestDTO.getComment())
                .status(ReportStatus.RECEIVED)
                .product_id(product)
                .build();

        reportRepository.save(report);

        return ReportProductResponseDTO.builder()
                .report_id(report.getReport_id())
                .reporter_nickname(reporter.getNickname())
                .product_id(product.getId())
                .product_name(product.getTitle())
                .seller_nickname(product.getSeller().getNickname())
                .report_type(reportType)
                .comment(requestDTO.getComment())
                .status(ReportStatus.RECEIVED)
                .build();
    }

    // 사용자 신고
    @Transactional
    public ReportUserResponseDTO createUserReport(Long reporter_id, ReportUserRequestDTO requestDTO) {
        // 신고자
        User reporter = userRepository.findById(reporter_id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reporter id: " + reporter_id));

        // 신고당한 사용자
        User reportedUser = userRepository.findById(requestDTO.getReportedUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid reported user id: " + requestDTO.getReportedUserId()));

        ReportType reportType = enumCastingUtil.castingReportType(requestDTO.getReport_type());

        // 신고 build
        Report report = Report.builder()
                .reporter_id(reporter)
                .report_type(reportType)
                .comment(requestDTO.getComment())
                .status(ReportStatus.RECEIVED)
                .reported_user_id(reportedUser)
                .build();

        reportRepository.save(report);

        return ReportUserResponseDTO.builder()
                .report_id(report.getReport_id())
                .reporter_nickname(reporter.getNickname())
                .reportedUserId(reportedUser.getId())
                .reported_user_nickname(reportedUser.getNickname())
                .report_type(reportType)
                .comment(requestDTO.getComment())
                .status(ReportStatus.RECEIVED)
                .build();
    }

    // 메시지 신고
    @Transactional
    public ReportMessageResponseDTO createMessageReport(Long reporter_id, ReportMessageRequestDTO requestDTO) {
        // 신고자
        User reporter = userRepository.findById(reporter_id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reporter id: " + reporter_id));

        // 신고당한 메시지
        Message message = messageRepository.findById(requestDTO.getMessage_id())
                .orElseThrow(() -> new IllegalArgumentException("Invalid message id: " + requestDTO.getMessage_id()));

        ReportType reportType = enumCastingUtil.castingReportType(requestDTO.getReport_type());

        // 신고 build
        Report report = Report.builder()
                .reporter_id(reporter)
                .report_type(reportType)
                .comment(requestDTO.getComment())
                .status(ReportStatus.RECEIVED)
                .message_id(message)
                .build();

        reportRepository.save(report);

        return ReportMessageResponseDTO.builder()
                .report_id(report.getReport_id())
                .reporter_nickname(reporter.getNickname())
                .message_id(message.getId())
                .message_content(message.getContent())
                .message_author_nickname(message.getNickname())
                .report_type(reportType)
                .comment(requestDTO.getComment())
                .status(ReportStatus.RECEIVED)
                .build();
    }

    // ===== 기존 Post/Reply 신고 기능 (사용 안 함 - 커뮤니티 게시판 제거됨) =====
    // 삭제 예정: createPostReport(), createReplyReport()

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

        Page<Report> reportPage;

        // 신고 유형에 따라 조회
        String type = pagingRequestDTO.getType().toLowerCase();
        switch (type) {
            case "product":
                reportPage = reportRepository.findAllProductReport(ReportStatus.RECEIVED, PageRequest.of(page-1, pageLimit));
                break;
            case "user":
                reportPage = reportRepository.findAllUserReport(ReportStatus.RECEIVED, PageRequest.of(page-1, pageLimit));
                break;
            case "message":
                reportPage = reportRepository.findAllMessageReport(ReportStatus.RECEIVED, PageRequest.of(page-1, pageLimit));
                break;
            default:
                throw new IllegalArgumentException("Invalid report type: " + type);
        }

        // 각 Report를 ReportResponseDto로 변환
        Page<ReportResponseDTO> reportResponseDtos = reportPage.map(ReportResponseDTO::new);

        return new PageResponseDTO(reportResponseDtos);
    }

}
