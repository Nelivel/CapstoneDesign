package com.example.deskclean.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "kiosk_transaction")
@Getter
@Setter
@NoArgsConstructor
public class KioskTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "serial_number", unique = true, nullable = false, length = 6)
    private String serialNumber; // 6자리 숫자 일련번호

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "buyer_id")
    private Long buyerId;

    @Column(name = "cabinet_number")
    private Integer cabinetNumber; // 1~8번 캐비닛

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt; // 일련번호 만료 시간 (30분)

    public enum TransactionStatus {
        WAITING,      // 일련번호 발급, 물품 보관 대기
        DEPOSITED,    // 물품 보관 완료
        PAID,         // 구매자 결제 완료
        COMPLETED,    // 거래 완료 (수령 완료)
        CANCELLED     // 거래 취소
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        // 일련번호 발급 후 30분 만료
        this.expiresAt = LocalDateTime.now().plusMinutes(30);
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 6자리 랜덤 숫자 일련번호 생성
    public static String generateSerialNumber() {
        return String.format("%06d", (int) (Math.random() * 1000000));
    }

    // 1~8 랜덤 캐비닛 번호 할당
    public static Integer assignCabinetNumber() {
        return (int) (Math.random() * 8) + 1;
    }
}
