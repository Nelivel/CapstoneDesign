package com.example.deskclean.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Ejection extends BaseTimeEntity {
    // 시스템에서 사용자를 차단했을때 기록되는 테이블

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ejection_id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ejection_uid", nullable = false)
    private User ejection_uid; // 차단된 유저 UID

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "admin_uid")
    private User admin_uid; // 차단한 관리자

    @Column(nullable = false)
    private String ejected_reason; // 차단 이유 서술

    @Column(nullable = false, unique = true)
    private String user_email; // 차단된 유저 이메일

//    @Column(name = "created_at", updatable = false, nullable = false)
//    private LocalDateTime created_at; // 생성시간
}
