package com.example.deskclean.repository;

import com.example.deskclean.domain.Enum.ReportStatus;
import com.example.deskclean.domain.Post;
import com.example.deskclean.domain.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {
//    @Query("SELECT r FROM Report r WHERE r.post_id IS NOT NULL ORDER BY r.report_id DESC")
//    Page<Report> findAllPostReport(@Param("reportStatus") ReportStatus reportStatus, Pageable pageable);
//
//    @Query("SELECT r FROM Report r WHERE r.reply_id IS NOT NULL ORDER BY r.report_id DESC")
//    Page<Report> findAllReplyReport(@Param("reportStatus") ReportStatus reportStatus, Pageable pageable);

    // POST 유형의 신고 목록을 상태에 따라 조회 (ReportStatus 필터링 추가)
    @Query("SELECT r FROM Report r WHERE r.post_id IS NOT NULL AND r.status = :reportStatus ORDER BY r.report_id DESC")
    Page<Report> findAllPostReport(@Param("reportStatus") ReportStatus reportStatus, Pageable pageable);

    // REPLY 유형의 신고 목록을 상태에 따라 조회 (ReportStatus 필터링 추가)
    @Query("SELECT r FROM Report r WHERE r.reply_id IS NOT NULL AND r.status = :reportStatus ORDER BY r.report_id DESC")
    Page<Report> findAllReplyReport(@Param("reportStatus") ReportStatus reportStatus, Pageable pageable);

    // 관리자 기능: 상태별 신고 수 조회
    long countByStatus(ReportStatus status);

    // 관리자 기능: 특정 사용자가 신고당한 횟수 조회 (Post 작성자 + Reply 작성자)
    @Query("SELECT COUNT(r) FROM Report r WHERE " +
           "(r.post_id.author.id = :userId) OR " +
           "(r.reply_id.author.id = :userId)")
    long countReportsByUser(@Param("userId") Long userId);
}
