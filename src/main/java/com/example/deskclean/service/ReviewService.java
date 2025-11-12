package com.example.deskclean.service;

import com.example.deskclean.domain.Enum.ReviewItem;
import com.example.deskclean.domain.Product;
import com.example.deskclean.domain.TransactionReview;
import com.example.deskclean.domain.User;
import com.example.deskclean.dto.Review.ReviewSubmitRequestDTO;
import com.example.deskclean.dto.Review.ReviewResponseDTO;
import com.example.deskclean.dto.Review.UserReliabilityResponseDTO;
import com.example.deskclean.repository.ProductRepository;
import com.example.deskclean.repository.TransactionReviewRepository;
import com.example.deskclean.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final TransactionReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    /**
     * 리뷰 제출 및 신뢰도 점수 업데이트
     */
    @Transactional
    public ReviewResponseDTO submitReview(Long reviewerId, ReviewSubmitRequestDTO request) {
        // 1. 엔티티 조회
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("평가자를 찾을 수 없습니다."));
        User reviewee = userRepository.findById(request.getRevieweeId())
                .orElseThrow(() -> new IllegalArgumentException("평가 대상자를 찾을 수 없습니다."));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        // 2. 중복 리뷰 확인
        if (reviewRepository.existsByReviewerIdAndRevieweeIdAndProductId(
                reviewerId, request.getRevieweeId(), request.getProductId())) {
            throw new IllegalStateException("이미 해당 거래에 대한 리뷰를 작성했습니다.");
        }

        // 3. 본인 평가 방지
        if (reviewerId.equals(request.getRevieweeId())) {
            throw new IllegalArgumentException("본인은 평가할 수 없습니다.");
        }

        // 4. 점수 계산 (긍정 항목 +0.1, 부정 항목 -0.1)
        double score = calculateScore(request.getReviewItems());

        // 5. TransactionReview 엔티티 생성 및 저장
        TransactionReview review = TransactionReview.builder()
                .product(product)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .reviewItems(request.getReviewItems())
                .score(score)
                .build();
        TransactionReview savedReview = reviewRepository.save(review);

        // 6. 평가 대상자의 신뢰도 점수 업데이트
        updateReliabilityScore(reviewee, score, request.getReviewItems());

        return ReviewResponseDTO.fromEntity(savedReview);
    }

    /**
     * 선택된 평가 항목들로부터 점수 계산
     * 긍정 항목: +0.1, 부정 항목: -0.1
     */
    private double calculateScore(List<ReviewItem> reviewItems) {
        double score = 0.0;
        for (ReviewItem item : reviewItems) {
            if (item.isPositive()) {
                score += 0.1;
            } else {
                score -= 0.1;
            }
        }
        // 소수점 둘째 자리까지 반올림
        return Math.round(score * 100.0) / 100.0;
    }

    /**
     * 가중 평균 방식으로 신뢰도 점수 업데이트
     * 새로운 평균 = (기존 평균 × 기존 거래수 + 이번 평가 점수) / (거래수 + 1)
     */
    private void updateReliabilityScore(User reviewee, double newScore, List<ReviewItem> reviewItems) {
        // 현재 신뢰도 정보
        double currentScore = reviewee.getReliability_score();
        int currentTransactions = reviewee.getTotal_transactions();

        // 신뢰도 점수 업데이트 (기본값 2.0에서 시작하여 누적)
        double updatedScore = currentScore + newScore;

        // 점수 범위 제한 (0.0 ~ 4.5)
        updatedScore = Math.max(0.0, Math.min(4.5, updatedScore));

        // 소수점 둘째 자리까지 반올림
        updatedScore = Math.round(updatedScore * 100.0) / 100.0;

        // 긍정/부정 평가 수 계산
        long positiveCount = reviewItems.stream().filter(ReviewItem::isPositive).count();
        long negativeCount = reviewItems.stream().filter(ReviewItem::isNegative).count();

        // User 엔티티 업데이트
        reviewee.setReliability_score(updatedScore);
        reviewee.setTotal_transactions(currentTransactions + 1);
        reviewee.setPositive_reviews(reviewee.getPositive_reviews() + (int) positiveCount);
        reviewee.setNegative_reviews(reviewee.getNegative_reviews() + (int) negativeCount);

        userRepository.save(reviewee);
    }

    /**
     * 특정 사용자가 받은 모든 리뷰 조회
     */
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByRevieweeId(Long revieweeId) {
        List<TransactionReview> reviews = reviewRepository.findByRevieweeId(revieweeId);
        return reviews.stream()
                .map(ReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 특정 사용자가 작성한 모든 리뷰 조회
     */
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByReviewerId(Long reviewerId) {
        List<TransactionReview> reviews = reviewRepository.findByReviewerId(reviewerId);
        return reviews.stream()
                .map(ReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 특정 상품에 대한 모든 리뷰 조회
     */
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByProductId(Long productId) {
        List<TransactionReview> reviews = reviewRepository.findByProductId(productId);
        return reviews.stream()
                .map(ReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 사용자 신뢰도 정보 조회
     */
    @Transactional(readOnly = true)
    public UserReliabilityResponseDTO getUserReliability(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return UserReliabilityResponseDTO.fromEntity(user);
    }
}
