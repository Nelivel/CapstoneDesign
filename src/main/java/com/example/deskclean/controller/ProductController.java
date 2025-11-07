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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/product")
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
}

// TODO
// - JWT 인증 구현
// - Custom Exception 처리
