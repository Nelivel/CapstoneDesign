package com.example.deskclean.service;

import com.example.deskclean.domain.Enum.Status;
import com.example.deskclean.domain.Product;
import com.example.deskclean.domain.ProductImage;
import com.example.deskclean.domain.User;
import com.example.deskclean.dto.Product.ProductCreateRequestDTO;
import com.example.deskclean.dto.Product.ProductResponseDTO;
import com.example.deskclean.dto.Product.ProductUpdateRequestDTO;
import com.example.deskclean.repository.ProductImageRepository;
import com.example.deskclean.repository.ProductRepository;
import com.example.deskclean.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductImageRepository productImageRepository;

    // Create
    @Transactional
    public Product save(Long sellerId, ProductCreateRequestDTO request) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid seller id: " + sellerId));

        Product product = request.toEntity(seller);
        return productRepository.save(product);
    }

    // Read
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    // ID로 상품 조회 (이미지 포함)
    public Optional<ProductResponseDTO> findByIdWithImages(Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    List<String> imageUrls = productImageRepository.findByItemDbid(id)
                            .stream()
                            .map(ProductImage::getImageUrl)
                            .map(this::convertToHttpUrl)
                            .collect(Collectors.toList());
                    return ProductResponseDTO.fromEntityWithImages(product, imageUrls);
                });
    }

    // 로컬 경로를 HTTP URL로 변환
    private String convertToHttpUrl(String localPath) {
        // "/mnt/sdb-data/daangn_images/4418_c08a36790c5ee912.webp"
        // -> "http://34.94.118.159/img/4418_c08a36790c5ee912.webp"
        if (localPath == null || localPath.isEmpty()) {
            return localPath;
        }

        // 파일명 추출 (마지막 / 이후의 문자열)
        int lastSlashIndex = localPath.lastIndexOf('/');
        if (lastSlashIndex != -1 && lastSlashIndex < localPath.length() - 1) {
            String fileName = localPath.substring(lastSlashIndex + 1);
            return "http://34.94.118.159/img/" + fileName;
        }

        return localPath;
    }

    public Page<Product> findPageable(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    

    // Update
    @Transactional
    public Optional<Product> update(Long id, ProductUpdateRequestDTO updateRequest) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setCategory(updateRequest.getCategory());
                    product.setTitle(updateRequest.getTitle());
                    product.setContent(updateRequest.getContent());
                    product.setPrice(updateRequest.getPrice());
                    product.setStatus(updateRequest.getStatus());
                    return productRepository.save(product);
                });
    }

    // Delete (soft delete)
    @Transactional
    public boolean softDelete(Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    product.set_deleted(true);
                    productRepository.save(product);
                    return true;
                }).orElse(false);
    }

    // 거래 완료 처리
    @Transactional
    public Product completeTransaction(Long productId, Long buyerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("구매자를 찾을 수 없습니다."));

        // 이미 거래 완료된 상품인지 확인
        if (product.is_completed()) {
            throw new IllegalStateException("이미 거래가 완료된 상품입니다.");
        }

        // 판매자가 자기 상품을 구매할 수 없음
        if (product.getSeller().getId().equals(buyerId)) {
            throw new IllegalArgumentException("판매자는 본인의 상품을 구매할 수 없습니다.");
        }

        product.set_completed(true);
        product.setStatus(2);

        return productRepository.save(product);
    }
}
