package com.example.deskclean.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "hidden_product", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HiddenProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "hidden_at", nullable = false)
    private LocalDateTime hiddenAt;

    @PrePersist
    protected void onCreate() {
        hiddenAt = LocalDateTime.now();
    }
}
