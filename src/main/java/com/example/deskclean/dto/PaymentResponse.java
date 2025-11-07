package com.example.deskclean.dto;

// 결제 Response DTO

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PaymentResponse {
    private String orderId;
    private String tid;
    private String redirectUrl;
}
