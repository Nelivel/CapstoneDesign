package com.example.deskclean.repository;

import com.example.deskclean.domain.HiddenProduct;
import com.example.deskclean.domain.Product;
import com.example.deskclean.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HiddenProductRepository extends JpaRepository<HiddenProduct, Long> {
    // 특정 사용자가 숨긴 상품 목록 조회
    List<HiddenProduct> findByUser(User user);

    // 특정 사용자가 특정 상품을 숨겼는지 확인
    Optional<HiddenProduct> findByUserAndProduct(User user, Product product);

    // 특정 사용자가 특정 상품을 숨겼는지 확인 (boolean)
    boolean existsByUserAndProduct(User user, Product product);

    // 특정 사용자가 숨긴 상품 모두 삭제
    void deleteByUserAndProduct(User user, Product product);
}
