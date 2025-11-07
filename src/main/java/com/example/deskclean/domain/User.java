package com.example.deskclean.domain;

import com.example.deskclean.domain.Enum.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users") // DB 테이블 이름을 'users'로 지정
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username; // 로그인 ID

    @Column(nullable = false)
    private String password; // 암호화된 비밀번호

    @Column(unique = true, nullable = false)
    private String nickname; // 채팅에서 사용할 별명

    @Enumerated(EnumType.STRING)
    @Column(nullable = true) // 기존 데이터와의 호환성을 위해 nullable
    @Builder.Default
    private Role role = Role.USER; // 기본값 USER

    @Column(nullable = true) // 기존 데이터와의 호환성을 위해 nullable
    @Builder.Default
    private Boolean is_suspended = false; // 정지 여부

    private String suspension_reason; // 정지 사유

    // 회원 탈퇴 관련 필드 (Soft Delete)
    @Column(nullable = true)
    @Builder.Default
    private Boolean is_deleted = false; // 삭제(탈퇴) 여부

    private LocalDateTime deleted_at; // 삭제(탈퇴) 일시
}