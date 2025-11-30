package com.example.deskclean.controller;

import com.example.deskclean.domain.Product;
import com.example.deskclean.dto.Product.ProductResponseDTO;
import com.example.deskclean.service.FavoriteService;
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
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Log4j2
public class FavoriteController {

    private final FavoriteService favoriteService;

    /**
     * 즐겨찾기 목록 조회 API
     * GET /api/favorites
     */
    @GetMapping
    public ResponseEntity<?> getFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            List<Product> favorites = favoriteService.getFavorites(username);

            // Product 엔티티를 DTO로 변환
            List<ProductResponseDTO> favoriteDTOs = favorites.stream()
                    .map(ProductResponseDTO::fromEntity)
                    .collect(Collectors.toList());

            log.info("즐겨찾기 목록 조회 성공: {}", username);
            return ResponseEntity.ok(favoriteDTOs);

        } catch (Exception e) {
            log.error("즐겨찾기 목록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "즐겨찾기 목록 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 즐겨찾기 추가 API
     * POST /api/favorites/{productId}
     */
    @PostMapping("/{productId}")
    public ResponseEntity<?> addFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        try {
            String username = userDetails.getUsername();
            favoriteService.addFavorite(username, productId);

            log.info("즐겨찾기 추가 성공: {}, productId={}", username, productId);
            return ResponseEntity.ok(Map.of("message", "즐겨찾기에 추가되었습니다."));

        } catch (IllegalArgumentException e) {
            log.warn("즐겨찾기 추가 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("즐겨찾기 추가 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "즐겨찾기 추가 중 오류가 발생했습니다."));
        }
    }

    /**
     * 즐겨찾기 삭제 API
     * DELETE /api/favorites/{productId}
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        try {
            String username = userDetails.getUsername();
            favoriteService.removeFavorite(username, productId);

            log.info("즐겨찾기 삭제 성공: {}, productId={}", username, productId);
            return ResponseEntity.ok(Map.of("message", "즐겨찾기에서 삭제되었습니다."));

        } catch (IllegalArgumentException e) {
            log.warn("즐겨찾기 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("즐겨찾기 삭제 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "즐겨찾기 삭제 중 오류가 발생했습니다."));
        }
    }
}
