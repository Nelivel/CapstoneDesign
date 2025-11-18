package com.example.deskclean.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
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
                // 로그인 페이지, 루트 페이지, 회원가입 API, 결제 콜백 API 등은 모두 허용
                .requestMatchers("/", "/login", "/api/auth/signup",
                                 "/api/payments/success", "/api/payments/cancel", "/api/payments/fail",
                                 "/api/reviews/**","/recommend","/api/products/**").permitAll()
                // 나머지는 로그인 필요
                .anyRequest().permitAll()
            )
            // 🔥 Basic 인증(브라우저 팝업) 완전 비활성화
            .httpBasic(AbstractHttpConfigurer::disable)

            // 🔐 스프링 시큐리티 기본 로그인 폼 사용 (/login)
            // .formLogin(form -> form
            //     //.loginPage("/login")  // 커스텀 페이지 쓰려면 이거 켜고, GET /login 컨트롤러/뷰 필요
            //     .defaultSuccessUrl("/chat", true) // 로그인 성공 후 /chat으로 이동
            //     .permitAll()
            // )
            .formLogin(AbstractHttpConfigurer::disable)
            .logout(logout -> logout
                .logoutSuccessUrl("/") // 로그아웃 후 루트로
            )
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                corsConfig.setAllowedOrigins(java.util.Arrays.asList(
                    "http://localhost:3000",
                    "http://localhost:5173",
                    "http://localhost:5174"
                ));
                corsConfig.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                corsConfig.setAllowedHeaders(java.util.Arrays.asList("*"));
                corsConfig.setAllowCredentials(true);
                return corsConfig;
            }))
            .csrf(csrf -> csrf.disable()); 

        return http.build();
    }
}
