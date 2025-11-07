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
    private final Category category;
    private final String productName;
    private final String productDescription;
    private final Long productPrice;
    private final Status status;
    private final Location location;
    private final int viewCount;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    @Builder
    public ProductResponseDTO(Long id, Long sellerId, String sellerNickname, Category category,
                             String productName, String productDescription, Long productPrice,
                             Status status, Location location, int viewCount,
                             LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.sellerId = sellerId;
        this.sellerNickname = sellerNickname;
        this.category = category;
        this.productName = productName;
        this.productDescription = productDescription;
        this.productPrice = productPrice;
        this.status = status;
        this.location = location;
        this.viewCount = viewCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Entity를 DTO로 변환하는 정적 팩토리 메서드
    public static ProductResponseDTO fromEntity(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .sellerId(product.getSeller().getId())
                .sellerNickname(product.getSeller().getNickname())
                .category(product.getCategory())
                .productName(product.getProduct_name())
                .productDescription(product.getProduct_description())
                .productPrice(product.getProduct_price())
                .status(product.getStatus())
                .location(product.getLocation())
                .viewCount(product.getView_count())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
