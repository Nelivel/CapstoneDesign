package com.example.deskclean.domain;

import com.example.deskclean.domain.Enum.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id;

    // 어떤 상품의 결제인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // 결제한 사용자 (buyer)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    private String orderId;   // 주문 고유번호
    private String tid;       // 카카오페이 거래 ID
    private Long amount;      // 결제 금액

    @Enumerated(EnumType.STRING)
    private PaymentStatus status; // READY, SUCCESS, CANCEL, FAIL

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = PaymentStatus.READY;
    }
}
