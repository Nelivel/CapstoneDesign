package com.example.deskclean.controller;

import com.example.deskclean.domain.Product;
import com.example.deskclean.dto.Product.ProductResponseDTO;
import com.example.deskclean.service.HistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
@Log4j2
public class HistoryController {

    private final HistoryService historyService;

    /**
     * 판매 내역 조회 API
     * GET /api/history/sell
     */
    @GetMapping("/sell")
    public ResponseEntity<?> getSellHistory(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            List<Product> sellHistory = historyService.getSellHistory(username);

            // Product 엔티티를 DTO로 변환
            List<ProductResponseDTO> sellHistoryDTOs = sellHistory.stream()
                    .map(ProductResponseDTO::fromEntity)
                    .collect(Collectors.toList());

            log.info("판매 내역 조회 성공: {}", username);
            return ResponseEntity.ok(sellHistoryDTOs);

        } catch (Exception e) {
            log.error("판매 내역 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "판매 내역 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 구매 내역 조회 API
     * GET /api/history/buy
     */
    @GetMapping("/buy")
    public ResponseEntity<?> getBuyHistory(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            List<Product> buyHistory = historyService.getBuyHistory(username);

            // Product 엔티티를 DTO로 변환
            List<ProductResponseDTO> buyHistoryDTOs = buyHistory.stream()
                    .map(ProductResponseDTO::fromEntity)
                    .collect(Collectors.toList());

            log.info("구매 내역 조회 성공: {}", username);
            return ResponseEntity.ok(buyHistoryDTOs);

        } catch (Exception e) {
            log.error("구매 내역 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "구매 내역 조회 중 오류가 발생했습니다."));
        }
    }
}
