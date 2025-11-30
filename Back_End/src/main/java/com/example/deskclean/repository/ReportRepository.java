package com.example.deskclean.repository;

import com.example.deskclean.domain.Enum.ReportStatus;
import com.example.deskclean.domain.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // ===== 새로운 신고 조회 쿼리 =====

    // 상품 신고 목록 조회
    @Query("SELECT r FROM Report r WHERE r.product_id IS NOT NULL AND r.status = :reportStatus ORDER BY r.report_id DESC")
    Page<Report> findAllProductReport(@Param("reportStatus") ReportStatus reportStatus, Pageable pageable);

    // 사용자 신고 목록 조회
    @Query("SELECT r FROM Report r WHERE r.reported_user_id IS NOT NULL AND r.status = :reportStatus ORDER BY r.report_id DESC")
    Page<Report> findAllUserReport(@Param("reportStatus") ReportStatus reportStatus, Pageable pageable);

    // 메시지 신고 목록 조회
    @Query("SELECT r FROM Report r WHERE r.message_id IS NOT NULL AND r.status = :reportStatus ORDER BY r.report_id DESC")
    Page<Report> findAllMessageReport(@Param("reportStatus") ReportStatus reportStatus, Pageable pageable);

    // 관리자 기능: 상태별 신고 수 조회
    long countByStatus(ReportStatus status);

    // 관리자 기능: 특정 사용자가 신고당한 횟수 조회 (사용자 직접 신고 + 상품 판매자 신고)
    @Query("SELECT COUNT(r) FROM Report r WHERE " +
           "(r.reported_user_id.id = :userId) OR " +
           "(r.product_id.seller.id = :userId)")
    long countReportsByUser(@Param("userId") Long userId);

    // ===== 기존 Post/Reply 신고 쿼리 (사용 안 함 - 커뮤니티 게시판 제거됨) =====
    // 삭제 예정
}
