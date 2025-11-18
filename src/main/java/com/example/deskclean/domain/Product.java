package com.example.deskclean.domain;

import java.time.LocalDateTime;

import com.example.deskclean.domain.Enum.Category;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Valid
public class Product extends BaseTimeEntity {

    // 식별자
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dbid")
    private Long id;

    // 판매자 (User와의 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User seller;

    // 카테고리 선택 (enum 타입)
    @NotNull
    private String category;

    // 상품명
    @NotNull
    private String title;

    // 상품 설명
    @Column(columnDefinition = "TEXT")
    @NotNull
    private String content;

    // 상품 가격
    @NotNull
    private Long price;

    // 상품 상태 (정수형)
    @NotNull
    @Column(name = "status")
    private int status;

    // 삭제 여부 (soft delete)
    @Builder.Default
    private boolean is_deleted = false;

    // 조회수
    @Builder.Default
    private int view_count = 0;

    // 거래 완료 여부
    @Builder.Default
    @Column(nullable = false)
    private boolean is_completed = false;
}
