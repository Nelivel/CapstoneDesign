package com.example.deskclean.repository;

import com.example.deskclean.domain.EmailVerificationToken;
import com.example.deskclean.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByToken(String token);

    List<EmailVerificationToken> findByUser(User user);

    List<EmailVerificationToken> findByUserAndTokenType(User user, String tokenType);

    // 만료된 토큰 삭제를 위한 메서드
    void deleteByExpiryDateBefore(LocalDateTime date);
}
