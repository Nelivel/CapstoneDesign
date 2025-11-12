package com.example.deskclean.dto.Review;

import com.example.deskclean.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReliabilityResponseDTO {

    private Long userId;
    private String nickname;
    private Double reliabilityScore;
    private Integer totalTransactions;
    private Integer positiveReviews;
    private Integer negativeReviews;

    public static UserReliabilityResponseDTO fromEntity(User user) {
        return UserReliabilityResponseDTO.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .reliabilityScore(user.getReliability_score())
                .totalTransactions(user.getTotal_transactions())
                .positiveReviews(user.getPositive_reviews())
                .negativeReviews(user.getNegative_reviews())
                .build();
    }
}
