package com.example.deskclean.dto.Review;

import com.example.deskclean.domain.Enum.ReviewItem;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSubmitRequestDTO {

    @NotNull(message = "평가자 ID는 필수입니다.")
    private Long reviewerId;

    @NotNull(message = "상품 ID는 필수입니다.")
    private Long productId;

    @NotNull(message = "평가 대상자 ID는 필수입니다.")
    private Long revieweeId;

    @NotEmpty(message = "최소 1개 이상의 평가 항목을 선택해야 합니다.")
    private List<ReviewItem> reviewItems;
}
