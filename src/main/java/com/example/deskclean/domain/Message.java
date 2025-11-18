package com.example.deskclean.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // [중요] 메시지를 보낸 사람 (User와 연결)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    @Column(nullable = false)
    private String content;

    // 메시지 작성 시점의 닉네임 (성능 향상 및 데이터 보존을 위해)
    @Column(nullable = false)
    private String nickname;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_read")
    private Boolean isRead = false;

    // 채팅방 ID (향후 여러 채팅방 지원을 위한 필드)
    @Column(name = "chat_room_id")
    private Long chatRoomId;
}