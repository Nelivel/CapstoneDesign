package com.example.deskclean.domain;

import com.example.deskclean.domain.Enum.Category;
import com.example.deskclean.domain.Enum.Location;
import com.example.deskclean.domain.Enum.Status;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "product")
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
    @Column(name = "product_id")
    private Long id;

    // 판매자 (User와의 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    // 카테고리 선택 (enum 타입)
    @Enumerated(EnumType.STRING)
    @NotNull
    private Category category;

    // 상품명
    @NotNull
    private String product_name;

    // 상품 설명
    @NotNull
    private String product_description;

    // 상품 가격
    @NotNull
    private Long product_price;

    // 상품 상태 (enum 타입)
    @Enumerated(EnumType.STRING)
    @NotNull
    private Status status;

    // 삭제 여부 (soft delete)
    @Builder.Default
    private boolean is_deleted = false;

    // 조회수
    @Builder.Default
    private int view_count = 0;

    // 거래 희망 위치 (enum 타입)
    @Enumerated(EnumType.STRING)
    @NotNull
    private Location location;
}
