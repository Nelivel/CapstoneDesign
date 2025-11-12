package com.example.deskclean.controller;

import com.example.deskclean.dto.Review.ReviewSubmitRequestDTO;
import com.example.deskclean.dto.Review.ReviewResponseDTO;
import com.example.deskclean.dto.Review.UserReliabilityResponseDTO;
import com.example.deskclean.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * 리뷰 제출
     * POST /api/reviews
     */
    @PostMapping
    public ResponseEntity<ReviewResponseDTO> submitReview(
            @RequestHeader(value = "Authorization", required = false) String token,
            @Valid @RequestBody ReviewSubmitRequestDTO request) {

        // TODO: JWT 토큰에서 reviewer_id 추출하도록 수정 필요
        // 현재는 DTO에서 reviewerId를 받아서 사용
        ReviewResponseDTO response = reviewService.submitReview(request.getReviewerId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * 특정 사용자가 받은 모든 리뷰 조회
     * GET /api/reviews/received/{userId}
     */
    @GetMapping("/received/{userId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReceivedReviews(@PathVariable Long userId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByRevieweeId(userId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * 특정 사용자가 작성한 모든 리뷰 조회
     * GET /api/reviews/written/{userId}
     */
    @GetMapping("/written/{userId}")
    public ResponseEntity<List<ReviewResponseDTO>> getWrittenReviews(@PathVariable Long userId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByReviewerId(userId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * 특정 상품에 대한 모든 리뷰 조회
     * GET /api/reviews/product/{productId}
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponseDTO>> getProductReviews(@PathVariable Long productId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByProductId(productId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * 사용자 신뢰도 정보 조회
     * GET /api/reviews/reliability/{userId}
     */
    @GetMapping("/reliability/{userId}")
    public ResponseEntity<UserReliabilityResponseDTO> getUserReliability(@PathVariable Long userId) {
        UserReliabilityResponseDTO reliability = reviewService.getUserReliability(userId);
        return ResponseEntity.ok(reliability);
    }
}
