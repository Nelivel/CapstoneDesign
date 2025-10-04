package com.example.deskclean.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.StompSubProtocolHandler;
import org.springframework.messaging.simp.stomp.StompSession;

@Slf4j
@RequiredArgsConstructor
@Controller
public class ChatController {

    private final SimpMessageSendingOperations messagingTemplate;

    @GetMapping("/test")
    @ResponseBody
    public String test() {
        log.info("=== HTTP 테스트 엔드포인트 호출됨 ===");
        return "WebSocket 서버가 정상 작동 중입니다!";
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.info("=== WebSocket 연결됨 ===");
        log.info("Session ID: {}", event.getMessage().getHeaders().get("simpSessionId"));
        log.info("Event: {}", event);
        log.info("Headers: {}", event.getMessage().getHeaders());
        log.info("=== WebSocket 연결 성공! ===");
    }

    // WebSocket 연결 이벤트를 강제로 감지하는 핸들러
    @EventListener
    public void handleAllEvents(Object event) {
        String eventName = event.getClass().getSimpleName();
        
        // WebSocket 관련 이벤트만 로깅
        if (eventName.contains("Session") || eventName.contains("Stomp") || 
            eventName.contains("WebSocket") || eventName.contains("Message")) {
            log.info("=== WebSocket 이벤트 감지: {} ===", eventName);
            log.info("이벤트 상세: {}", event);
        }
    }

    // Postman 연결을 위한 특별한 핸들러
    @EventListener
    public void handlePostmanConnection(Object event) {
        String eventName = event.getClass().getSimpleName();
        
        // Postman 연결 감지
        if (eventName.contains("Session") || eventName.contains("Stomp")) {
            log.info("=== Postman 연결 감지: {} ===", eventName);
            log.info("Postman 이벤트: {}", event);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        log.info("=== WebSocket 연결 해제됨 ===");
        log.info("Session ID: {}", event.getSessionId());
        log.info("Event: {}", event);
    }

    // WebSocket 관련 이벤트만 캐치하는 핸들러
    @EventListener
    public void handleWebSocketEvents(Object event) {
        String eventName = event.getClass().getSimpleName();
        
        // WebSocket 관련 이벤트만 필터링
        if (eventName.contains("Session") || eventName.contains("Stomp") || 
            eventName.contains("WebSocket") || eventName.contains("Message")) {
            log.info("=== WebSocket 관련 이벤트: {} ===", eventName);
            log.info("이벤트 상세: {}", event);
        }
    }

    // STOMP 연결 이벤트를 제대로 캐치하는 핸들러
    @EventListener
    public void handleStompConnectEvent(SessionConnectedEvent event) {
        log.info("=== STOMP 연결 이벤트 감지 ===");
        log.info("Session ID: {}", event.getMessage().getHeaders().get("simpSessionId"));
        log.info("Event: {}", event);
        log.info("Headers: {}", event.getMessage().getHeaders());
        log.info("=== STOMP 연결 성공! ===");
    }

    @MessageMapping("/chat/message")
    public void message(ChatMessage message) {
        log.info("=== WebSocket 메시지 수신 ===");
        log.info("Type: {}", message.getType());
        log.info("RoomId: {}", message.getRoomId());
        log.info("Sender: {}", message.getSender());
        log.info("Message: {}", message.getMessage());
        log.info("=============================");

        if (ChatMessage.MessageType.ENTER.equals(message.getType())) {
            message.setMessage(message.getSender() + "님이 입장하셨습니다.");
        }
        
        String destination = "/sub/chat/room/" + message.getRoomId();
        log.info("메시지 전송 대상: {}", destination);
        
        messagingTemplate.convertAndSend(destination, message);
        log.info("메시지 전송 완료: {}", message);
    }

    // 간단한 WebSocket 채팅을 위한 엔드포인트
    @GetMapping("/simple-chat")
    @ResponseBody
    public String simpleChat() {
        return "간단한 WebSocket 채팅 시스템입니다! <a href='/simple-chat.html'>채팅 시작</a>";
    }
}