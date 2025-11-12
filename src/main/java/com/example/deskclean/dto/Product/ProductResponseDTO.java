package com.example.deskclean.dto.Product;

import com.example.deskclean.domain.Enum.Category;
import com.example.deskclean.domain.Enum.Location;
import com.example.deskclean.domain.Enum.Status;
import com.example.deskclean.domain.Product;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ProductResponseDTO {

    private final Long id;
    private final Long sellerId;
    private final String sellerNickname;
    private final Long buyerId;
    private final String buyerNickname;
    private final Category category;
    private final String productName;
    private final String productDescription;
    private final Long productPrice;
    private final Status status;
    private final Location location;
    private final int viewCount;
    private final boolean isCompleted;
    private final boolean isDeleted;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    @Builder
    public ProductResponseDTO(Long id, Long sellerId, String sellerNickname, Long buyerId, String buyerNickname,
                             Category category, String productName, String productDescription, Long productPrice,
                             Status status, Location location, int viewCount, boolean isCompleted, boolean isDeleted,
                             LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.sellerId = sellerId;
        this.sellerNickname = sellerNickname;
        this.buyerId = buyerId;
        this.buyerNickname = buyerNickname;
        this.category = category;
        this.productName = productName;
        this.productDescription = productDescription;
        this.productPrice = productPrice;
        this.status = status;
        this.location = location;
        this.viewCount = viewCount;
        this.isCompleted = isCompleted;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Entity를 DTO로 변환하는 정적 팩토리 메서드
    public static ProductResponseDTO fromEntity(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .sellerId(product.getSeller().getId())
                .sellerNickname(product.getSeller().getNickname())
                .buyerId(product.getBuyer() != null ? product.getBuyer().getId() : null)
                .buyerNickname(product.getBuyer() != null ? product.getBuyer().getNickname() : null)
                .category(product.getCategory())
                .productName(product.getProduct_name())
                .productDescription(product.getProduct_description())
                .productPrice(product.getProduct_price())
                .status(product.getStatus())
                .location(product.getLocation())
                .viewCount(product.getView_count())
                .isCompleted(product.is_completed())
                .isDeleted(product.is_deleted())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
