package com.example.deskclean.dto;

import com.example.deskclean.domain.Message;
import com.example.deskclean.domain.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Message DTO - 순환 참조 방지 및 필요한 데이터만 전송
 */
public class MessageDTO {
    private Long id;
    private UserSummaryDTO user;
    private String content;
    private String nickname;
    private Long productId;
    private LocalDateTime createdAt;
    private Boolean isRead;
    private List<UserSummaryDTO> readBy;

    // 기본 생성자
    public MessageDTO() {}

    // Message 엔티티로부터 DTO 생성
    public MessageDTO(Message message) {
        this.id = message.getId();
        this.user = message.getUser() != null ? new UserSummaryDTO(message.getUser()) : null;
        this.content = message.getContent();
        this.nickname = message.getNickname();
        this.productId = message.getProductId();
        this.createdAt = message.getCreatedAt();
        this.isRead = message.getIsRead();
        this.readBy = message.getReadBy() != null
            ? message.getReadBy().stream()
                .map(UserSummaryDTO::new)
                .collect(Collectors.toList())
            : List.of();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserSummaryDTO getUser() {
        return user;
    }

    public void setUser(UserSummaryDTO user) {
        this.user = user;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public List<UserSummaryDTO> getReadBy() {
        return readBy;
    }

    public void setReadBy(List<UserSummaryDTO> readBy) {
        this.readBy = readBy;
    }

    /**
     * 사용자 요약 정보 - 순환 참조 방지
     */
    public static class UserSummaryDTO {
        private Long id;
        private String username;
        private String nickname;

        public UserSummaryDTO() {}

        public UserSummaryDTO(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.nickname = user.getNickname();
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getNickname() {
            return nickname;
        }

        public void setNickname(String nickname) {
            this.nickname = nickname;
        }
    }
}
