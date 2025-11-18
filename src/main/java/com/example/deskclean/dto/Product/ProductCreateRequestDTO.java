package com.example.deskclean.dto.Product;

import com.example.deskclean.domain.Product;
import com.example.deskclean.domain.User;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProductCreateRequestDTO {

    @NotNull(message = "카테고리는 필수 항목입니다.")
    private String category;

    @NotBlank(message = "상품명은 필수 항목입니다.")
    private String title;

    @NotBlank(message = "상품 설명은 필수 항목입니다.")
    private String content;

    @NotNull(message = "상품 가격은 필수 항목입니다.")
    @Min(value = 0, message = "상품 가격은 0원 이상이어야 합니다.")
    private Long price;

    @NotNull(message = "상품 상태는 필수 항목입니다.")
    private int status;

    // DTO를 Entity로 변환하는 메서드
    public Product toEntity(User seller) {
        return Product.builder()
                .seller(seller)
                .category(this.category)
                .title(this.title)
                .content(this.content)
                .price(this.price)
                .status(this.status)
                .build();
    }
}
