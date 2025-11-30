package com.example.deskclean.repository;

import com.example.deskclean.domain.RemoteTrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RemoteTradeRepository extends JpaRepository<RemoteTrade, Long> {

    /**
     * 상품 ID로 비대면 거래 세션 조회
     */
    Optional<RemoteTrade> findByProductId(Long productId);

    /**
     * 상품 ID로 비대면 거래 세션 존재 여부 확인
     */
    boolean existsByProductId(Long productId);
}
