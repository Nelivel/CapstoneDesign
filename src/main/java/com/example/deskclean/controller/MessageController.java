package com.example.deskclean.controller;

import com.example.deskclean.domain.Message;
import com.example.deskclean.domain.User;
import com.example.deskclean.repository.MessageRepository;
import com.example.deskclean.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private static final Logger log = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    // 전체 메시지 목록 조회
    // GET /api/messages
    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {
        List<Message> messages = messageRepository.findAll();
        return ResponseEntity.ok(messages);
    }

    // 특정 사용자의 메시지 내역 조회 (읽음 상태 포함)
    // GET /api/messages/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getMessagesByUserId(@PathVariable Long userId) {
        log.info("=== getMessagesByUserId called for userId: {} ===", userId);

        // 1. 사용자 존재 확인
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.error("User not found: {}", userId);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "User not found",
                "userId", userId
            ));
        }

        User user = userOpt.get();
        log.info("User found: username={}, nickname={}", user.getUsername(), user.getNickname());

        // 2. 최근 메시지 ID 조회
        List<Long> recentMessageIds = messageRepository.findRecentMessageIds();
        log.info("Found {} recent message IDs", recentMessageIds.size());

        if (recentMessageIds.isEmpty()) {
            log.info("No recent messages found, returning empty list");
            return ResponseEntity.ok(Collections.emptyList());
        }

        // 3. 메시지 상세 정보 조회
        List<Message> recentMessages = messageRepository.findByIdsWithUser(recentMessageIds);
        log.info("Loaded {} messages", recentMessages.size());

        // 4. 응답 DTO 생성
        List<Map<String, Object>> response = new ArrayList<>();

        for (Message msg : recentMessages) {
            try {
                if (msg.getUser() == null) {
                    log.warn("Message id={} has null user, skipping", msg.getId());
                    continue;
                }

                if (msg.getUser().getId() == null) {
                    log.warn("Message id={} has user with null ID, skipping", msg.getId());
                    continue;
                }

                Map<String, Object> messageMap = new HashMap<>();
                messageMap.put("messageId", msg.getId());
                messageMap.put("nickname", msg.getNickname());
                messageMap.put("content", msg.getContent());
                messageMap.put("createdAt", msg.getCreatedAt());

                // isRead 필드 사용
                Boolean isRead = msg.getIsRead();
                messageMap.put("isRead", isRead != null ? isRead : false);
                messageMap.put("isMine", msg.getUser().getId().equals(userId));

                response.add(messageMap);

            } catch (Exception e) {
                log.error("Error processing message id={}: {}", msg.getId(), e.getMessage(), e);
            }
        }

        log.info("Returning {} messages after processing", response.size());
        return ResponseEntity.ok(response);
    }
}
