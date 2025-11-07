package com.example.deskclean.dto;

// 결제 요청 DTO

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {

    @NotNull
    private Long productId;  // 어떤 상품을 결제할지

    @NotNull
    private Long buyerId;    // 결제자(유저) id
}
