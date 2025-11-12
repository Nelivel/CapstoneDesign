package com.example.deskclean.service;

import com.example.deskclean.domain.Enum.Status;
import com.example.deskclean.domain.Product;
import com.example.deskclean.domain.User;
import com.example.deskclean.dto.Product.ProductCreateRequestDTO;
import com.example.deskclean.dto.Product.ProductUpdateRequestDTO;
import com.example.deskclean.repository.ProductRepository;
import com.example.deskclean.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

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

    public Page<Product> findPageable(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    // Update
    @Transactional
    public Optional<Product> update(Long id, ProductUpdateRequestDTO updateRequest) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setCategory(updateRequest.getCategory());
                    product.setProduct_name(updateRequest.getProductName());
                    product.setProduct_description(updateRequest.getProductDescription());
                    product.setProduct_price(updateRequest.getProductPrice());
                    product.setStatus(updateRequest.getStatus());
                    product.setLocation(updateRequest.getLocation());
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

        product.setBuyer(buyer);
        product.set_completed(true);
        product.setStatus(Status.SOLD_OUT);

        return productRepository.save(product);
    }
}
