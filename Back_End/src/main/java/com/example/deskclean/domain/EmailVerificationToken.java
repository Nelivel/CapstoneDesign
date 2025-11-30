package com.example.deskclean.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "email_verification_tokens")
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String email; // 인증할 이메일 주소

    @Column(nullable = false)
    @Builder.Default
    private String tokenType = "EMAIL"; // "EMAIL" 또는 "SCHOOL_EMAIL"

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean used = false;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * 토큰 생성 헬퍼 메서드
     */
    public static EmailVerificationToken createToken(User user, String email, String tokenType) {
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(24); // 24시간 유효

        return EmailVerificationToken.builder()
                .token(token)
                .user(user)
                .email(email)
                .tokenType(tokenType)
                .expiryDate(expiryDate)
                .build();
    }

    /**
     * 토큰 만료 여부 확인
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }

    /**
     * 토큰 유효성 검증
     */
    public boolean isValid() {
        return !this.used && !this.isExpired();
    }
}
