package com.example.deskclean.controller;


import com.example.deskclean.dto.KakaoApproveResponse;
import com.example.deskclean.dto.PaymentRequest;
import com.example.deskclean.dto.PaymentResponse;
import com.example.deskclean.service.KakaoPayService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final KakaoPayService kakaoPayService;

    @PostMapping("/ready")
    public ResponseEntity<PaymentResponse> ready(@RequestBody PaymentRequest req) {
        return ResponseEntity.ok(kakaoPayService.ready(req));
    }

    @GetMapping("/success")
    public void success(
            @RequestParam("orderId") String orderId,
            @RequestParam("pg_token") String pgToken,
            HttpServletResponse response) throws IOException {
        KakaoApproveResponse approveResponse = kakaoPayService.approve(orderId, pgToken);
        // 결제 성공 후 메인 페이지 또는 결제 완료 페이지로 리다이렉트
        response.sendRedirect("/?payment=success&orderId=" + orderId + "&amount=" + approveResponse.getAmount().getTotal());
    }

    @GetMapping("/cancel")
    public void cancel(@RequestParam("orderId") String orderId, HttpServletResponse response) throws IOException {
        // 결제 취소 시 메인 페이지로 리다이렉트
        response.sendRedirect("/?payment=cancelled&orderId=" + orderId);
    }

    @GetMapping("/fail")
    public void fail(@RequestParam("orderId") String orderId, HttpServletResponse response) throws IOException {
        // 결제 실패 시 메인 페이지로 리다이렉트
        response.sendRedirect("/?payment=failed&orderId=" + orderId);
    }
}
