package com.example.deskclean.repository;

import com.example.deskclean.domain.TransactionReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionReviewRepository extends JpaRepository<TransactionReview, Long> {

    // 특정 상품에 대한 모든 리뷰 조회
    List<TransactionReview> findByProductId(Long productId);

    // 특정 사용자가 작성한 모든 리뷰 조회 (평가자 기준)
    List<TransactionReview> findByReviewerId(Long reviewerId);

    // 특정 사용자가 받은 모든 리뷰 조회 (평가 대상자 기준)
    List<TransactionReview> findByRevieweeId(Long revieweeId);

    // 중복 리뷰 방지: 특정 평가자가 특정 상품에 대해 특정 평가 대상자에게 이미 리뷰를 작성했는지 확인
    Optional<TransactionReview> findByReviewerIdAndRevieweeIdAndProductId(
            Long reviewerId, Long revieweeId, Long productId);

    // 특정 상품에 대한 리뷰가 존재하는지 확인
    boolean existsByReviewerIdAndRevieweeIdAndProductId(
            Long reviewerId, Long revieweeId, Long productId);
}
