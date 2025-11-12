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
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER; // 기본값 USER

    @Column(nullable = false)
    @Builder.Default
    private Boolean is_suspended = false; // 정지 여부

    private String suspension_reason; // 정지 사유

    // 회원 탈퇴 관련 필드 (Soft Delete)
    @Column(nullable = true)
    @Builder.Default
    private Boolean is_deleted = false; // 삭제(탈퇴) 여부

    private LocalDateTime deleted_at; // 삭제(탈퇴) 일시

    // 신뢰도 시스템 관련 필드
    @Column(nullable = false)
    @Builder.Default
    private Double reliability_score = 2.0; // 신뢰도 점수 (0.0 ~ 4.5, 기본값 2.0)

    @Column(nullable = false)
    @Builder.Default
    private Integer total_transactions = 0; // 총 거래 횟수

    @Column(nullable = false)
    @Builder.Default
    private Integer positive_reviews = 0; // 받은 긍정 평가 수

    @Column(nullable = false)
    @Builder.Default
    private Integer negative_reviews = 0; // 받은 부정 평가 수
}