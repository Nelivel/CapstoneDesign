package com.example.deskclean.dto.Product;

import com.example.deskclean.domain.Product;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class ProductResponseDTO {

    private final Long id;
    private final Long sellerId;
    private final String sellerNickname;
    private final String category;
    private final String title;
    private final String content;
    private final Long price;
    private final int status;
    private final int viewCount;
    private final boolean isCompleted;
    private final boolean isDeleted;
    private final LocalDateTime createdAt;
    private final List<String> imageUrls;

    @Builder
    public ProductResponseDTO(Long id, Long sellerId, String sellerNickname,
    String category, String title, String content, Long price,
                             int status, int viewCount, boolean isCompleted, boolean isDeleted,
                             LocalDateTime createdAt, LocalDateTime updatedAt, List<String> imageUrls) {
        this.id = id;
        this.sellerId = sellerId;
        this.sellerNickname = sellerNickname;
        this.category = category;
        this.title = title;
        this.content = content;
        this.price = price;
        this.status = status;
        this.viewCount = viewCount;
        this.isCompleted = isCompleted;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.imageUrls = imageUrls;
    }

    // Entity를 DTO로 변환하는 정적 팩토리 메서드
    public static ProductResponseDTO fromEntity(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .sellerId(product.getSeller().getId())
                .sellerNickname(product.getSeller().getNickname())
                .category(product.getCategory())
                .title(product.getTitle())
                .content(product.getContent())
                .price(product.getPrice())
                .status(product.getStatus())
                .viewCount(product.getView_count())
                .isCompleted(product.is_completed())
                .isDeleted(product.is_deleted())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .imageUrls(null)
                .build();
    }

    // Entity와 이미지 URL 리스트로 DTO를 생성하는 정적 팩토리 메서드
    public static ProductResponseDTO fromEntityWithImages(Product product, List<String> imageUrls) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .sellerId(product.getSeller().getId())
                .sellerNickname(product.getSeller().getNickname())
                .category(product.getCategory())
                .title(product.getTitle())
                .content(product.getContent())
                .price(product.getPrice())
                .status(product.getStatus())
                .viewCount(product.getView_count())
                .isCompleted(product.is_completed())
                .isDeleted(product.is_deleted())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .imageUrls(imageUrls)
                .build();
    }
}
