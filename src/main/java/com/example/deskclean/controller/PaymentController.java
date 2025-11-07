package com.example.deskclean.controller;


import com.example.deskclean.dto.KakaoApproveResponse;
import com.example.deskclean.dto.PaymentRequest;
import com.example.deskclean.dto.PaymentResponse;
import com.example.deskclean.service.KakaoPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<KakaoApproveResponse> success(
            @RequestParam("orderId") String orderId,
            @RequestParam("pg_token") String pgToken) {
        return ResponseEntity.ok(kakaoPayService.approve(orderId, pgToken));
    }

    @GetMapping("/cancel")
    public String cancel(@RequestParam("orderId") String orderId) {
        return "결제가 취소되었습니다. 주문번호: " + orderId;
    }

    @GetMapping("/fail")
    public String fail(@RequestParam("orderId") String orderId) {
        return "결제가 실패했습니다. 주문번호: " + orderId;
    }
}
