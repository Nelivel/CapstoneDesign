package com.example.deskclean.domain;

import com.example.deskclean.domain.Enum.ReviewItem;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "transaction_review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionReview extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long id;

    // 거래한 상품
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // 평가자 (리뷰를 작성하는 사람)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    // 평가 대상자 (리뷰를 받는 사람)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private User reviewee;

    // 선택된 평가 항목들 (Enum을 문자열 리스트로 저장)
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "review_items", joinColumns = @JoinColumn(name = "review_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "item")
    @Builder.Default
    private List<ReviewItem> reviewItems = new ArrayList<>();

    // 점수 (긍정 항목은 +0.1, 부정 항목은 -0.1)
    @Column(nullable = false)
    private Double score;
}
