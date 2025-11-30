package com.example.deskclean.controller;

import com.example.deskclean.domain.Product;
import com.example.deskclean.dto.Product.ProductCreateRequestDTO;
import com.example.deskclean.dto.Product.ProductResponseDTO;
import com.example.deskclean.dto.Product.ProductUpdateRequestDTO;
import com.example.deskclean.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    // Create
    @PostMapping
    public ResponseEntity<ProductResponseDTO> addProduct(
            @RequestHeader(value = "Authorization", required = false) String token,
            @Valid @RequestBody ProductCreateRequestDTO request) {

        // TODO: JWT 토큰에서 user_id 추출 로직 구현 필요
        Long sellerId = 1L; // 임시 하드코딩

        Product savedProduct = productService.save(sellerId, request);
        ProductResponseDTO response = ProductResponseDTO.fromEntity(savedProduct);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Read
    // 전체 상품 목록 조회
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> viewAllProduct() {
        List<Product> products = productService.findAll();
        List<ProductResponseDTO> responses = products.stream()
                .map(ProductResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // 특정 상품 아이디 검색 조회
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> viewProduct(@PathVariable Long id) {
        return productService.findById(id)
                .map(product -> ResponseEntity.ok(ProductResponseDTO.fromEntity(product)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 페이징 처리
    @GetMapping("/paging")
    public ResponseEntity<Page<ProductResponseDTO>> viewPagingProduct(
            @PageableDefault(size = 5, sort = "id") Pageable pageable) {

        Page<Product> productsPage = productService.findPageable(pageable);
        Page<ProductResponseDTO> responses = productsPage.map(ProductResponseDTO::fromEntity);
        return ResponseEntity.ok(responses);
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequestDTO request) {
        return productService.update(id, request)
                .map(updatedProduct -> ResponseEntity.ok(ProductResponseDTO.fromEntity(updatedProduct)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete (soft delete mapping)
    @PutMapping("/{id}/soft")
    public ResponseEntity<Void> softDelete(@PathVariable Long id) {
        boolean isDeleted = productService.softDelete(id);
        if (isDeleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 거래 완료 처리
    @PutMapping("/{id}/complete")
    public ResponseEntity<ProductResponseDTO> completeTransaction(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {

        // TODO: JWT 토큰에서 buyer_id 추출
        Long buyerId = 2L; // 임시 하드코딩 (판매자 ID와 다른 값)

        Product completedProduct = productService.completeTransaction(id, buyerId);
        ProductResponseDTO response = ProductResponseDTO.fromEntity(completedProduct);
        return ResponseEntity.ok(response);
    }

    /**
     * 상품 이미지 업로드 API
     * POST /api/products/{id}/image
     */
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 이미지 파일 검증
            if (image.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "이미지 파일이 비어있습니다."));
            }

            // 파일 크기 제한 (10MB)
            if (image.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "파일 크기는 10MB를 초과할 수 없습니다."));
            }

            // 파일 타입 검증
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "이미지 파일만 업로드 가능합니다."));
            }

            // 업로드 디렉토리 생성
            String uploadDir = "uploads/products";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 고유한 파일명 생성
            String originalFilename = image.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            // 파일 저장
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 이미지 URL 생성
            String imageUrl = "/uploads/products/" + uniqueFilename;

            // Product 엔티티에 이미지 URL 저장 (서비스 레이어 사용)
            String username = userDetails.getUsername();
            productService.updateProductImage(id, username, imageUrl);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("message", "이미지가 성공적으로 업로드되었습니다.");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "이미지 업로드 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}

// TODO
// - JWT 인증 구현
// - Custom Exception 처리
