package com.example.deskclean.dto.Review;

import com.example.deskclean.domain.Enum.ReviewItem;
import com.example.deskclean.domain.TransactionReview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDTO {

    private Long reviewId;
    private Long productId;
    private String productName;
    private Long reviewerId;
    private String reviewerNickname;
    private Long revieweeId;
    private String revieweeNickname;
    private List<ReviewItem> reviewItems;
    private Double score;
    private LocalDateTime createdAt;

    public static ReviewResponseDTO fromEntity(TransactionReview review) {
        return ReviewResponseDTO.builder()
                .reviewId(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getProduct_name())
                .reviewerId(review.getReviewer().getId())
                .reviewerNickname(review.getReviewer().getNickname())
                .revieweeId(review.getReviewee().getId())
                .revieweeNickname(review.getReviewee().getNickname())
                .reviewItems(review.getReviewItems())
                .score(review.getScore())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
