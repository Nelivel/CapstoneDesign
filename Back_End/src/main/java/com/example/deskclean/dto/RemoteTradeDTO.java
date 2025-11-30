package com.example.deskclean.dto;

import com.example.deskclean.domain.RemoteTrade;

import java.time.LocalDateTime;

/**
 * RemoteTrade DTO - 프론트엔드로 전달할 데이터
 */
public class RemoteTradeDTO {
    private Long id;
    private Long productId;
    private String status;
    private Long sellerId;
    private Long buyerId;
    private Integer finalPrice;
    private Integer paidAmount;
    private LocalDateTime sellerStartedAt;
    private LocalDateTime sellerCompletedAt;
    private LocalDateTime buyerPaidAt;
    private LocalDateTime buyerCompletedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RemoteTradeDTO() {}

    public RemoteTradeDTO(RemoteTrade remoteTrade) {
        this.id = remoteTrade.getId();
        this.productId = remoteTrade.getProductId();
        this.status = remoteTrade.getStatus().name();
        this.sellerId = remoteTrade.getSellerId();
        this.buyerId = remoteTrade.getBuyerId();
        this.finalPrice = remoteTrade.getFinalPrice();
        this.paidAmount = remoteTrade.getPaidAmount();
        this.sellerStartedAt = remoteTrade.getSellerStartedAt();
        this.sellerCompletedAt = remoteTrade.getSellerCompletedAt();
        this.buyerPaidAt = remoteTrade.getBuyerPaidAt();
        this.buyerCompletedAt = remoteTrade.getBuyerCompletedAt();
        this.createdAt = remoteTrade.getCreatedAt();
        this.updatedAt = remoteTrade.getUpdatedAt();
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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
}
