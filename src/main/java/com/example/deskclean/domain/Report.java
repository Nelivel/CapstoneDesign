package com.example.deskclean.domain;

import com.example.deskclean.domain.Enum.ReportStatus;
import com.example.deskclean.domain.Enum.ReportType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Report extends BaseTimeEntity {
    // 신고 테이블

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long report_id;

    // 신고를 당한 사용자가 아닌, 신고를 한 사용자의 정보도 필요함
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reporter_id" , nullable = false)
    private User reporter_id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportType report_type; // 신고 사유 선택

    @Column(nullable = false)
    private String comment; // 신고 상세 사유


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;


    // 신고 대상 (상품, 사용자, 메시지 중 하나만 설정됨)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product_id; // 신고타겟 product id

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id")
    private User reported_user_id; // 신고타겟 user id

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private Message message_id; // 신고타겟 message id

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "admin_uid")
    private User admin_uid; // 신고 처리 관리자

    // 신고 상태 변경 메서드
    public void setStatus(ReportStatus status, User admin_uid) {
        this.status = status;
        this.admin_uid = admin_uid;
    }
}
