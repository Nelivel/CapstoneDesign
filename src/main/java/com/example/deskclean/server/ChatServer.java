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

@ServerEndpoint("/chatserver/{username}")
@Component
public class ChatServer {

    private static Set<Session> clients = Collections.synchronizedSet(new HashSet<>());
    private static Map<String, Long> userSessions = new ConcurrentHashMap<>(); // username -> userId 매핑
    private static MessageRepository messageRepository;
    private static UserRepository userRepository; 

    @Autowired
    public void setMessageRepository(MessageRepository repo) {
        ChatServer.messageRepository = repo;
    }

    @Autowired
    public void setUserRepository(UserRepository repo) {
        ChatServer.userRepository = repo;
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("username") String username) throws IOException {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IOException("인증되지 않은 사용자입니다: " + username));
            String nickname = user.getNickname();

            session.getUserProperties().put("username", username);
            session.getUserProperties().put("nickname", nickname);
            session.getUserProperties().put("userId", user.getId());
            clients.add(session);
            userSessions.put(username, user.getId());
            
            // 최근 메시지 히스토리 로드 (최근 50개)
            List<Message> recentMessages = messageRepository.findAllByOrderByCreatedAtDesc()
                    .stream()
                    .limit(50)
                    .collect(java.util.stream.Collectors.toList());
            
            for (Message msg : recentMessages) {
                Map<String, Object> messageMap = new HashMap<>();
                messageMap.put("type", "TALK");
                messageMap.put("nickname", msg.getNickname());
                messageMap.put("content", msg.getContent());
                messageMap.put("messageId", msg.getId());
                session.getBasicRemote().sendText(new Gson().toJson(messageMap));
            }
            
            Map<String, String> message = new HashMap<>();
            message.put("type", "ENTER");
            message.put("nickname", nickname);
            broadcast(new Gson().toJson(message));
            
            System.out.println("User " + username + " connected. Total clients: " + clients.size());
        } catch (Exception e) {
            System.err.println("Error in onOpen for " + username + ": " + e.getMessage());
            session.close();
        }
    }
    
    @OnMessage
    public void onMessage(String messageJson, Session session) throws IOException {
        try {
            Gson gson = new Gson();
            Map<String, Object> receivedMsg = gson.fromJson(messageJson, Map.class);
            String messageType = (String) receivedMsg.get("type");
            
            String username = (String) session.getUserProperties().get("username");
            String nickname = (String) session.getUserProperties().get("nickname");
            Long userId = (Long) session.getUserProperties().get("userId");
            
            if (userId == null) {
                System.err.println("User ID not found in session");
                return;
            }
            
            User user = userRepository.findById(userId)
                    .orElse(null);
            
            if (user == null) {
                System.err.println("User not found for ID: " + userId);
                return;
            }

            if ("TALK".equals(messageType)) {
                // 일반 메시지 처리
                String content = (String) receivedMsg.get("content");
                
                Message message = new Message();
                message.setContent(content);
                message.setUser(user);
                message.setNickname(nickname);
                messageRepository.save(message);

                Map<String, Object> messageMap = new HashMap<>();
                messageMap.put("type", "TALK");
                messageMap.put("nickname", nickname);
                messageMap.put("content", content);
                messageMap.put("messageId", message.getId());
                broadcast(new Gson().toJson(messageMap));
                
                System.out.println("Message sent by " + nickname + ": " + content);
                
            } else if ("READ".equals(messageType)) {
                // 읽음 처리
                Object messageIdObj = receivedMsg.get("messageId");
                if (messageIdObj != null) {
                    try {
                        Long messageId;
                        if (messageIdObj instanceof Double) {
                            messageId = ((Double) messageIdObj).longValue();
                        } else if (messageIdObj instanceof Number) {
                            messageId = ((Number) messageIdObj).longValue();
                        } else {
                            messageId = Long.parseLong(messageIdObj.toString());
                        }
                        
                        // readBy를 포함하여 조회 (EAGER 로딩)
                        Message message = messageRepository.findByIdWithReadBy(messageId);
                        if (message != null && !message.getUser().getId().equals(userId)) {
                            // 자신이 보낸 메시지가 아닌 경우에만 읽음 처리
                            // readBy 컬렉션이 이미 해당 사용자를 포함하는지 확인
                            boolean alreadyRead = false;
                            for (User u : message.getReadBy()) {
                                if (u.getId().equals(userId)) {
                                    alreadyRead = true;
                                    break;
                                }
                            }
                            
                            if (!alreadyRead) {
                                message.getReadBy().add(user);
                                messageRepository.save(message);
                                
                                // 읽음 상태 브로드캐스트
                                Map<String, Object> readMap = new HashMap<>();
                                readMap.put("type", "READ");
                                readMap.put("messageId", messageId);
                                broadcast(new Gson().toJson(readMap));
                                System.out.println("Message " + messageId + " marked as read by " + nickname);
                            } else {
                                System.out.println("Message " + messageId + " already read by " + nickname);
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Error parsing messageId: " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error in onMessage: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @OnClose
    public void onClose(Session session) throws IOException {
        String nickname = (String) session.getUserProperties().get("nickname");
        String username = (String) session.getUserProperties().get("username");
        
        clients.remove(session);
        userSessions.remove(username);
        
        if (nickname != null) {
            Map<String, String> message = new HashMap<>();
            message.put("type", "LEAVE");
            message.put("nickname", nickname);
            broadcast(new Gson().toJson(message));
            System.out.println("User " + username + " disconnected. Total clients: " + clients.size());
        }
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
                System.err.println("Error broadcasting to client: " + e.getMessage());
                deadSessions.add(client);
            }
        }
        // 죽은 세션 제거
        for (Session dead : deadSessions) {
            clients.remove(dead);
        }
    }
}