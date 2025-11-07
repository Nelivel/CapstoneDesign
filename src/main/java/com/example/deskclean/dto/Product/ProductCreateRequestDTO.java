package com.example.deskclean.dto.Product;

import com.example.deskclean.domain.Enum.Category;
import com.example.deskclean.domain.Enum.Location;
import com.example.deskclean.domain.Enum.Status;
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
    private Category category;

    @NotBlank(message = "상품명은 필수 항목입니다.")
    private String productName;

    @NotBlank(message = "상품 설명은 필수 항목입니다.")
    private String productDescription;

    @NotNull(message = "상품 가격은 필수 항목입니다.")
    @Min(value = 0, message = "상품 가격은 0원 이상이어야 합니다.")
    private Long productPrice;

    @NotNull(message = "상품 상태는 필수 항목입니다.")
    private Status status;

    @NotNull(message = "거래 위치는 필수 항목입니다.")
    private Location location;

    // DTO를 Entity로 변환하는 메서드
    public Product toEntity(User seller) {
        return Product.builder()
                .seller(seller)
                .category(this.category)
                .product_name(this.productName)
                .product_description(this.productDescription)
                .product_price(this.productPrice)
                .status(this.status)
                .location(this.location)
                .build();
    }
}
