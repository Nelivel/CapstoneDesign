package com.example.deskclean.controller;

import com.example.deskclean.domain.Message;
import com.example.deskclean.domain.User;
import com.example.deskclean.dto.MessageDTO;
import com.example.deskclean.repository.MessageRepository;
import com.example.deskclean.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 전체 메시지 목록 조회
     * GET /api/messages
     */
    @GetMapping
    public ResponseEntity<List<MessageDTO>> getAllMessages() {
        try {
            logger.info("getAllMessages called");
            List<Message> messages = messageRepository.findAll();
            logger.info("Found {} messages", messages.size());

            // Message 엔티티를 MessageDTO로 변환 (순환 참조 방지)
            List<MessageDTO> messageDTOs = messages.stream()
                .map(MessageDTO::new)
                .collect(Collectors.toList());

            return ResponseEntity.ok(messageDTOs);
        } catch (Exception e) {
            logger.error("Error in getAllMessages: ", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * 특정 상품의 메시지 목록 조회
     * GET /api/messages/product/{productId}
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByProduct(@PathVariable Long productId) {
        try {
            logger.info("getMessagesByProduct called for productId: {}", productId);
            List<Message> messages = messageRepository.findByProductIdWithReadBy(productId);
            logger.info("Found {} messages for productId: {}", messages.size(), productId);

            // Message 엔티티를 MessageDTO로 변환 (순환 참조 방지)
            List<MessageDTO> messageDTOs = messages.stream()
                .map(MessageDTO::new)
                .collect(Collectors.toList());

            return ResponseEntity.ok(messageDTOs);
        } catch (Exception e) {
            logger.error("Error in getMessagesByProduct for productId {}: ", productId, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * 특정 메시지를 읽음으로 표시
     * POST /api/messages/{messageId}/read
     */
    @PostMapping("/{messageId}/read")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long messageId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Message message = messageRepository.findById(messageId)
                    .orElseThrow(() -> new RuntimeException("Message not found"));

            // readBy에 현재 사용자 추가
            message.getReadBy().add(user);
            messageRepository.save(message);

            return ResponseEntity.ok().body("Message marked as read");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * 모든 메시지를 읽음으로 표시
     * POST /api/messages/read-all
     */
    @PostMapping("/read-all")
    public ResponseEntity<?> markAllMessagesAsRead() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 현재 사용자가 읽지 않은 모든 메시지 조회
            List<Message> unreadMessages = messageRepository.findUnreadMessagesForUser(user.getId());

            // 각 메시지의 readBy에 현재 사용자 추가
            for (Message message : unreadMessages) {
                message.getReadBy().add(user);
            }

            messageRepository.saveAll(unreadMessages);

            return ResponseEntity.ok().body(unreadMessages.size() + " messages marked as read");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}


