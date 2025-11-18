package com.example.deskclean.server;

import com.example.deskclean.domain.Message;
import com.example.deskclean.domain.User;
import com.example.deskclean.repository.MessageRepository;
import com.example.deskclean.repository.UserRepository;
import com.google.gson.Gson;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint(value = "/chatserver/{userId}", configurator = com.example.deskclean.config.WebSocketConfig.CustomSpringConfigurator.class)
@Component
@org.springframework.context.annotation.Scope("prototype")
public class ChatServer {

    private static final Logger log = LoggerFactory.getLogger(ChatServer.class);
    private static Set<Session> clients = Collections.synchronizedSet(new HashSet<>());
    private static Map<String, Long> userSessions = new ConcurrentHashMap<>();

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Autowired
    public ChatServer(MessageRepository messageRepository, UserRepository userRepository) {
        log.info("=== ChatServer constructor called ===");
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("userId") String userIdStr) throws IOException {
        log.info("=== WebSocket onOpen called for userId: {} ===", userIdStr);

        try {
            Long userId = Long.parseLong(userIdStr);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IOException("인증되지 않은 사용자입니다. userId: " + userId));

            String username = user.getUsername();
            String nickname = user.getNickname();

            session.getUserProperties().put("username", username);
            session.getUserProperties().put("nickname", nickname);
            session.getUserProperties().put("userId", user.getId());
            clients.add(session);
            userSessions.put(username, user.getId());

            // 최근 메시지 로드
            List<Long> recentMessageIds = messageRepository.findRecentMessageIds();
            List<Message> recentMessages = Collections.emptyList();

            if (!recentMessageIds.isEmpty()) {
                recentMessages = messageRepository.findByIdsWithUser(recentMessageIds);
            }

            // 메시지 전송
            for (Message msg : recentMessages) {
                if (msg.getUser() == null) {
                    continue;
                }

                Map<String, Object> messageMap = new HashMap<>();
                messageMap.put("type", "TALK");
                messageMap.put("nickname", msg.getNickname());
                messageMap.put("content", msg.getContent());
                messageMap.put("messageId", msg.getId());

                // isRead 필드 사용
                Boolean isRead = msg.getIsRead();
                messageMap.put("isRead", isRead != null ? isRead : false);

                session.getBasicRemote().sendText(new Gson().toJson(messageMap));
            }

            log.info("User {} (userId={}) connected. Total clients: {}", username, userId, clients.size());
        } catch (Exception e) {
            log.error("=== ERROR in onOpen for userId: {} ===", userIdStr, e);
            session.close();
        }
    }

    @OnMessage
    public void onMessage(String messageJson, Session session) throws IOException {
        try {
            Gson gson = new Gson();
            @SuppressWarnings("unchecked")
            Map<String, Object> receivedMsg = gson.fromJson(messageJson, Map.class);
            String messageType = (String) receivedMsg.get("type");

            String nickname = (String) session.getUserProperties().get("nickname");
            Long userId = (Long) session.getUserProperties().get("userId");

            if (userId == null) {
                log.error("User ID not found in session");
                return;
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.error("User not found for ID: {}", userId);
                return;
            }

            if ("TALK".equals(messageType)) {
                // 메시지 저장
                String content = (String) receivedMsg.get("content");

                Message message = new Message();
                message.setContent(content);
                message.setUser(user);
                message.setNickname(nickname);
                message.setChatRoomId(1L);
                message.setIsRead(false); // 새 메시지는 읽지 않음

                log.info("Saving message: content={}, chatRoomId={}, user={}",
                    content, message.getChatRoomId(), user.getId());
                messageRepository.save(message);
                log.info("Message saved with ID: {}, chatRoomId: {}",
                    message.getId(), message.getChatRoomId());

                // 브로드캐스트
                Map<String, Object> messageMap = new HashMap<>();
                messageMap.put("type", "TALK");
                messageMap.put("nickname", nickname);
                messageMap.put("content", content);
                messageMap.put("messageId", message.getId());
                messageMap.put("isRead", false);

                broadcast(new Gson().toJson(messageMap));
                log.info("Message sent by {}: {}", nickname, content);

            } else if ("READ".equals(messageType)) {
                // 읽음 처리
                Object messageIdObj = receivedMsg.get("messageId");
                if (messageIdObj == null) {
                    return;
                }

                Long messageId;
                if (messageIdObj instanceof Double) {
                    messageId = ((Double) messageIdObj).longValue();
                } else if (messageIdObj instanceof Number) {
                    messageId = ((Number) messageIdObj).longValue();
                } else {
                    messageId = Long.parseLong(messageIdObj.toString());
                }

                Message message = messageRepository.findById(messageId).orElse(null);
                if (message == null) {
                    log.warn("Message not found: {}", messageId);
                    return;
                }

                // 내가 보낸 메시지가 아닌 경우만 읽음 처리
                if (!message.getUser().getId().equals(userId)) {
                    message.setIsRead(true);
                    messageRepository.save(message);

                    // 읽음 상태 브로드캐스트
                    Map<String, Object> readMap = new HashMap<>();
                    readMap.put("type", "READ");
                    readMap.put("messageId", messageId);
                    broadcast(new Gson().toJson(readMap));

                    log.info("Message {} marked as read", messageId);
                }
            }

        } catch (Exception e) {
            log.error("Error in onMessage: {}", e.getMessage(), e);
        }
    }

    @OnClose
    public void onClose(Session session) throws IOException {
        String username = (String) session.getUserProperties().get("username");
        log.info("=== onClose called for username: {} ===", username);

        clients.remove(session);
        if (username != null) {
            userSessions.remove(username);
        }

        log.info("User {} disconnected. Total clients: {}", username, clients.size());
    }

    private void broadcast(String message) throws IOException {
        Set<Session> deadSessions = new HashSet<>();
        for (Session client : clients) {
            try {
                if (client.isOpen()) {
                    client.getBasicRemote().sendText(message);
                } else {
                    deadSessions.add(client);
                }
            } catch (Exception e) {
                log.error("Error broadcasting to client: {}", e.getMessage());
                deadSessions.add(client);
            }
        }
        for (Session dead : deadSessions) {
            clients.remove(dead);
        }
    }
}
