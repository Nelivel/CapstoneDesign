package com.example.deskclean.service;

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
}
