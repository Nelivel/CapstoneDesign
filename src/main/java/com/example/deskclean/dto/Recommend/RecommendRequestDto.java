package com.example.deskclean.dto.Recommend;

import java.math.BigInteger;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class RecommendRequestDto {
    @NotNull(message = "userId는 필수입니다")
    @JsonProperty("user_id")
    private BigInteger userId;

    @NotNull(message = "page는 필수입니다")
    @Min(value = 0, message = "page는 0 이상이어야 합니다")
    @JsonProperty("page")
    private Integer page;
}
