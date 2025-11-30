package com.example.deskclean.repository;

import com.example.deskclean.domain.KioskTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KioskTransactionRepository extends JpaRepository<KioskTransaction, Long> {

    Optional<KioskTransaction> findBySerialNumber(String serialNumber);

    Optional<KioskTransaction> findByProductId(Long productId);

    boolean existsBySerialNumber(String serialNumber);

    boolean existsByProductId(Long productId);
}
