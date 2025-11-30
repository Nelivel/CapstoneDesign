package com.example.deskclean.repository;

import com.example.deskclean.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // 로그인 및 API에서 사용할 사용자 조회 메소드
    Optional<User> findByUsername(String username);

    // 회원가입 시 중복 체크용
    boolean existsByUsername(String username);
    boolean existsByNickname(String nickname);

    // 프로필 수정 시 다른 사용자의 닉네임 중복 체크용
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.nickname = :nickname AND u.id != :userId")
    boolean existsByNicknameAndNotUserId(@Param("nickname") String nickname, @Param("userId") Long userId);

    // 관리자 기능: 닉네임으로 검색
    Page<User> findByNicknameContaining(String nickname, Pageable pageable);

    // 관리자 기능: 정지된 사용자 수 조회
    @Query("SELECT COUNT(u) FROM User u WHERE u.is_suspended = :isSuspended")
    long countBySuspendedStatus(@Param("isSuspended") Boolean isSuspended);
}