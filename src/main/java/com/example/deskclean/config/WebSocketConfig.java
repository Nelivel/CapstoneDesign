package com.example.deskclean.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 메시지 브로커 활성화 (단순화)
        registry.enableSimpleBroker("/sub");
        // 애플리케이션 목적지 접두사 설정 (단순화)
        registry.setApplicationDestinationPrefixes("/pub");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Postman용 WebSocket 엔드포인트 (CORS 설정 강화)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .setAllowedOrigins("*");
        
        // Postman용 STOMP 엔드포인트 (CORS 설정 강화)
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("*")
                .setAllowedOrigins("*");
        
        // 추가 테스트 엔드포인트
        registry.addEndpoint("/websocket")
                .setAllowedOriginPatterns("*")
                .setAllowedOrigins("*");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(8192);
        registration.setSendBufferSizeLimit(8192);
        registration.setSendTimeLimit(20000);
    }
}