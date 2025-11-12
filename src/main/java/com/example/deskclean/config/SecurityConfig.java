package com.example.deskclean.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // 로그인 페이지, 루트 페이지, 회원가입 API, 결제 콜백 API는 누구나 접근 허용
                .requestMatchers("/", "/login", "/api/auth/signup",
                                 "/api/payments/success", "/api/payments/cancel", "/api/payments/fail",
                                 "/api/reviews/**").permitAll()
                // 나머지 모든 요청 (채팅, API 등)은 인증(로그인)된 사용자만 접근 가능
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> {}) // Postman/API 테스트를 위한 Basic Auth 활성화
            .formLogin(form -> form
                //.loginPage("/login") // 커스텀 로그인 페이지 경로
                .defaultSuccessUrl("/chat", true) // 로그인 성공 시 '/chat'으로 이동
                .permitAll()
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/") // 로그아웃 성공 시 '/'로 이동
            )
            // ***********************************************************************************
            // ※[중요]※ 프론트엔드 연동을 위한 CORS 설정
            // ***********************************************************************************
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                corsConfig.setAllowedOrigins(java.util.Arrays.asList("http://localhost:3000", "http://localhost:5173", "http://localhost:5174")); // React, Vue, Next.js 등 기본 포트
                corsConfig.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                corsConfig.setAllowedHeaders(java.util.Arrays.asList("*"));
                corsConfig.setAllowCredentials(true);
                return corsConfig;
            }))
            // ***********************************************************************************
            // ※[중요]※ API 사용을 위해 CSRF 임시 비활성화 (나중에 프론트엔드와 연동 시 활성화 해야 하는데 위 옵션에 의해 안 넣어도 될 듯?)
            // ***********************************************************************************
            .csrf(csrf -> csrf.disable()); 
            
        return http.build();
    }
}