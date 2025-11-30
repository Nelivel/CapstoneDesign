package com.example.deskclean.repository;

import com.example.deskclean.domain.Enum.Status;
import com.example.deskclean.domain.Product;
import com.example.deskclean.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // 관리자 기능: 상태별 상품 수 조회
    long countByStatus(Status status);

    // 관리자 기능: 판매자별 상품 수 조회
    long countBySeller(User seller);

    // 삭제되지 않은 상품만 조회
    @Query("SELECT p FROM Product p WHERE p.is_deleted = false")
    List<Product> findAllNotDeleted();
}
