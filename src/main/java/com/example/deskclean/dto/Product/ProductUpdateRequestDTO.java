package com.example.deskclean.dto.Product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProductUpdateRequestDTO {

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
}
