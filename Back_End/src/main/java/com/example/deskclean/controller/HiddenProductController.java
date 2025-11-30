package com.example.deskclean.controller;

import com.example.deskclean.domain.HiddenProduct;
import com.example.deskclean.domain.Product;
import com.example.deskclean.domain.User;
import com.example.deskclean.repository.HiddenProductRepository;
import com.example.deskclean.repository.ProductRepository;
import com.example.deskclean.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class HiddenProductController {

    private final HiddenProductRepository hiddenProductRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // 상품 숨기기
    @PostMapping("/{productId}/hide")
    @Transactional
    public ResponseEntity<Void> hideProduct(
            @PathVariable Long productId,
            @RequestHeader(value = "Authorization", required = false) String token) {

        // TODO: JWT에서 실제 사용자 ID 추출
        Long userId = 1L; // 임시 하드코딩

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        // 이미 숨겨진 경우 중복 방지
        if (hiddenProductRepository.existsByUserAndProduct(user, product)) {
            return ResponseEntity.ok().build();
        }

        HiddenProduct hiddenProduct = HiddenProduct.builder()
                .user(user)
                .product(product)
                .build();

        hiddenProductRepository.save(hiddenProduct);
        return ResponseEntity.ok().build();
    }

    // 상품 숨기기 취소
    @DeleteMapping("/{productId}/hide")
    @Transactional
    public ResponseEntity<Void> unhideProduct(
            @PathVariable Long productId,
            @RequestHeader(value = "Authorization", required = false) String token) {

        // TODO: JWT에서 실제 사용자 ID 추출
        Long userId = 1L; // 임시 하드코딩

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        hiddenProductRepository.deleteByUserAndProduct(user, product);
        return ResponseEntity.noContent().build();
    }

    // 숨긴 상품 목록 조회
    @GetMapping("/hidden")
    public ResponseEntity<List<Long>> getHiddenProducts(
            @RequestHeader(value = "Authorization", required = false) String token) {

        // TODO: JWT에서 실제 사용자 ID 추출
        Long userId = 1L; // 임시 하드코딩

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<Long> hiddenProductIds = hiddenProductRepository.findByUser(user)
                .stream()
                .map(hp -> hp.getProduct().getId())
                .collect(Collectors.toList());

        return ResponseEntity.ok(hiddenProductIds);
    }
}
