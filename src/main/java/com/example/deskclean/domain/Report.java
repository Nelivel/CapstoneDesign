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


//    @Column(name = "created_at", updatable = false, nullable = false)
//    private LocalDateTime created_at; // 신고 날짜

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post_id; // 신고타겟 post id


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_id")
    private Reply reply_id; // 신고타겟 reply id

//chat으로 변경
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "message_id")
//    private Message message_id; // 신고타겟 message id

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "admin_uid")
    private User admin_uid; // 신고 처리 관리자

    // 신고 상태 변경 메서드
    public void setStatus(ReportStatus status, User admin_uid) {
        this.status = status;
        this.admin_uid = admin_uid;
    }
}
