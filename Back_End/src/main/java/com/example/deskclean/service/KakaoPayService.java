package com.example.deskclean.service;


import com.example.deskclean.domain.*;
import com.example.deskclean.domain.Enum.PaymentStatus;
import com.example.deskclean.dto.KakaoApproveResponse;
import com.example.deskclean.dto.KakaoReadyResponse;
import com.example.deskclean.dto.PaymentRequest;
import com.example.deskclean.dto.PaymentResponse;
import com.example.deskclean.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class KakaoPayService {

    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;  // 구매자 조회용
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${kakao.pay.secret-key}")
    private String secretKey;

    @Value("${kakao.pay.cid}")
    private String cid;

    @Value("${kakao.pay.ready-url}")
    private String readyUrl;

    @Value("${kakao.pay.approve-url}")
    private String approveUrl;

    @Value("${kakao.pay.success-url}")
    private String successUrl;

    @Value("${kakao.pay.cancel-url}")
    private String cancelUrl;

    @Value("${kakao.pay.fail-url}")
    private String failUrl;

    /** 결제 준비 요청 */
    @Transactional
    public PaymentResponse ready(PaymentRequest req) {
        // 상품 & 유저 확인
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품이 존재하지 않습니다."));
        User buyer = userRepository.findById(req.getBuyerId())
                .orElseThrow(() -> new IllegalArgumentException("구매자가 존재하지 않습니다."));

        String orderId = "ORD-" + System.currentTimeMillis();

        // 결제 엔티티 저장 (READY)
        Payment payment = Payment.builder()
                .product(product)
                .buyer(buyer)
                .amount(product.getProduct_price())
                .orderId(orderId)
                .status(PaymentStatus.READY)
                .build();
        paymentRepository.save(payment);

        // 카카오페이 요청 헤더
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "SECRET_KEY " + secretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 요청 바디
        Map<String, Object> body = Map.of(
                "cid", cid,
                "partner_order_id", orderId,
                "partner_user_id", buyer.getId().toString(),
                "item_name", product.getProduct_name(),
                "quantity", 1,
                "total_amount", product.getProduct_price(),
                "tax_free_amount", 0,
                "approval_url", successUrl + "?orderId=" + orderId,
                "cancel_url", cancelUrl + "?orderId=" + orderId,
                "fail_url", failUrl + "?orderId=" + orderId
        );

        ResponseEntity<KakaoReadyResponse> response = restTemplate.postForEntity(
                readyUrl, new HttpEntity<>(body, headers), KakaoReadyResponse.class
        );

        KakaoReadyResponse kakao = response.getBody();
        payment.setTid(kakao.getTid());
        paymentRepository.save(payment);

        return new PaymentResponse(orderId, kakao.getTid(), kakao.getNext_redirect_pc_url());
    }

    /** 결제 승인 요청 */
    @Transactional
    public KakaoApproveResponse approve(String orderId, String pgToken) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다."));

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "SECRET_KEY " + secretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "cid", cid,
                "tid", payment.getTid(),
                "partner_order_id", payment.getOrderId(),
                "partner_user_id", payment.getBuyer().getId().toString(),
                "pg_token", pgToken
        );

        ResponseEntity<KakaoApproveResponse> response = restTemplate.postForEntity(
                approveUrl, new HttpEntity<>(body, headers), KakaoApproveResponse.class
        );

        KakaoApproveResponse approve = response.getBody();
        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);
        return approve;
    }
}
