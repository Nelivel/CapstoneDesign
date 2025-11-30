package com.example.deskclean.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 비대면 거래 세션 엔티티
 * 상품별로 하나의 비대면 거래 세션이 존재
 */
@Entity
@Table(name = "remote_trade")
public class RemoteTrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 상품 ID (1:1 관계)
    @Column(nullable = false, unique = true)
    private Long productId;

    // 거래 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TradeStatus status = TradeStatus.PENDING;

    // 판매자 ID
    @Column(nullable = false)
    private Long sellerId;

    // 구매자 ID
    private Long buyerId;

    // 거래 가격 (확정된 가격)
    private Integer finalPrice;

    // 결제 금액
    private Integer paidAmount;

    // 판매자가 거래를 시작한 시간
    private LocalDateTime sellerStartedAt;

    // 판매자가 거래를 완료한 시간
    private LocalDateTime sellerCompletedAt;

    // 구매자가 결제한 시간
    private LocalDateTime buyerPaidAt;

    // 구매자가 거래를 완료한 시간
    private LocalDateTime buyerCompletedAt;

    // 생성 시간
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정 시간
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public TradeStatus getStatus() {
        return status;
    }

    public void setStatus(TradeStatus status) {
        this.status = status;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public Long getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(Long buyerId) {
        this.buyerId = buyerId;
    }

    public Integer getFinalPrice() {
        return finalPrice;
    }

    public void setFinalPrice(Integer finalPrice) {
        this.finalPrice = finalPrice;
    }

    public Integer getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Integer paidAmount) {
        this.paidAmount = paidAmount;
    }

    public LocalDateTime getSellerStartedAt() {
        return sellerStartedAt;
    }

    public void setSellerStartedAt(LocalDateTime sellerStartedAt) {
        this.sellerStartedAt = sellerStartedAt;
    }

    public LocalDateTime getSellerCompletedAt() {
        return sellerCompletedAt;
    }

    public void setSellerCompletedAt(LocalDateTime sellerCompletedAt) {
        this.sellerCompletedAt = sellerCompletedAt;
    }

    public LocalDateTime getBuyerPaidAt() {
        return buyerPaidAt;
    }

    public void setBuyerPaidAt(LocalDateTime buyerPaidAt) {
        this.buyerPaidAt = buyerPaidAt;
    }

    public LocalDateTime getBuyerCompletedAt() {
        return buyerCompletedAt;
    }

    public void setBuyerCompletedAt(LocalDateTime buyerCompletedAt) {
        this.buyerCompletedAt = buyerCompletedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * 거래 상태 ENUM
     */
    public enum TradeStatus {
        PENDING,              // 대기 중
        SELLER_READY,         // 판매자 준비 완료
        BUYER_PAID,           // 구매자 결제 완료
        SELLER_COMPLETED,     // 판매자 발송 완료
        COMPLETED             // 거래 완료
    }
}
