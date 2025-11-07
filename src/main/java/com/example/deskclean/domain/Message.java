package com.example.deskclean.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // [중요] 메시지를 보낸 사람 (User와 연결)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String content;
    
    // 메시지 작성 시점의 닉네임 (성능 향상 및 데이터 보존을 위해)
    @Column(nullable = false)
    private String nickname;
    
    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private Boolean isRead = false;
    
    // 이 메시지를 읽은 사용자들 (실시간 읽음 상태용)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "message_read_by",
        joinColumns = @JoinColumn(name = "message_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> readBy = new HashSet<>();
}