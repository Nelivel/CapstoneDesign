package com.example.deskclean.controller;

import com.example.deskclean.dto.User.SignupRequestDTO;
import com.example.deskclean.dto.User.SignupResponseDTO;
import com.example.deskclean.service.AuthService;
import com.example.deskclean.service.UserService;
import com.example.deskclean.service.EmailService;
import com.example.deskclean.domain.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Log4j2
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    /**
     * 회원가입 API
     * POST /api/auth/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequestDTO requestDTO, BindingResult bindingResult) {
        // 1. 입력값 검증 오류 처리
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            // 2. 회원가입 처리
            SignupResponseDTO responseDTO = authService.signup(requestDTO);

            log.info("회원가입 성공: {}", requestDTO.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);

        } catch (IllegalArgumentException e) {
            // 3. 중복 username/nickname 등의 비즈니스 로직 오류 처리
            log.warn("회원가입 실패: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            // 4. 예상치 못한 오류 처리
            log.error("회원가입 중 예상치 못한 오류 발생", e);

            Map<String, String> error = new HashMap<>();
            error.put("error", "회원가입 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 로그인 API
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest, HttpServletRequest request) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            // 인증 처리
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );

            // SecurityContext에 인증 정보 저장
            SecurityContext securityContext = SecurityContextHolder.getContext();
            securityContext.setAuthentication(authentication);

            // 세션에 SecurityContext 저장
            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

            // 사용자 정보 조회
            User user = userService.findByUsername(username);

            Map<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());
            response.put("nickname", user.getNickname());
            response.put("userId", user.getId());

            log.info("로그인 성공: {}", username);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.warn("로그인 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요."));
        }
    }

    /**
     * 로그아웃 API
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            SecurityContextHolder.clearContext();

            log.info("로그아웃 성공");
            return ResponseEntity.ok(Map.of("message", "로그아웃 되었습니다."));

        } catch (Exception e) {
            log.error("로그아웃 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "로그아웃 처리 중 오류가 발생했습니다."));
        }
    }

    /**
     * 이메일 인증 메일 재전송 API
     * POST /api/auth/resend-verification
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(HttpServletRequest request) {
        try {
            // 현재 로그인한 사용자 정보 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "로그인이 필요합니다."));
            }

            String username = authentication.getName();
            User user = userService.findByUsername(username);

            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "등록된 이메일이 없습니다. 고객센터에 문의해주세요."));
            }

            if (user.getEmailVerified()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "이미 인증된 이메일입니다."));
            }

            // 이메일 인증 메일 발송
            emailService.sendEmailVerification(user, user.getEmail());

            log.info("이메일 인증 메일 재전송 완료: {}", user.getEmail());
            return ResponseEntity.ok(Map.of("message", "인증 메일을 재전송했습니다."));

        } catch (Exception e) {
            log.error("이메일 인증 메일 재전송 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요."));
        }
    }

    /**
     * 학교 이메일 인증 요청 API
     * POST /api/auth/request-school-verification
     */
    @PostMapping("/request-school-verification")
    public ResponseEntity<?> requestSchoolVerification(@RequestParam String schoolEmail, HttpServletRequest request) {
        try {
            // 현재 로그인한 사용자 정보 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "로그인이 필요합니다."));
            }

            String username = authentication.getName();
            User user = userService.findByUsername(username);

            // 1차 이메일 인증 확인
            if (!user.getEmailVerified()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "이메일 인증을 먼저 완료해주세요."));
            }

            // 학교 이메일 형식 검증
            if (!schoolEmail.toLowerCase().endsWith("@o.shinhan.ac.kr")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "신한대학교 웹메일(@o.shinhan.ac.kr)만 인증할 수 있습니다."));
            }

            // 학교 이메일 인증 메일 발송
            emailService.sendSchoolEmailVerification(user, schoolEmail);

            log.info("학교 이메일 인증 메일 발송 완료: {}", schoolEmail);
            return ResponseEntity.ok(Map.of("message", "학교 인증 메일을 발송했습니다."));

        } catch (Exception e) {
            log.error("학교 이메일 인증 메일 발송 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요."));
        }
    }

    /**
     * 이메일 인증 확인 API (토큰 검증)
     * GET /api/auth/verify-email
     */
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            emailService.verifyEmail(token);
            log.info("이메일 인증 성공: token={}", token);
            return ResponseEntity.ok(Map.of("message", "이메일 인증이 완료되었습니다."));

        } catch (IllegalArgumentException e) {
            log.warn("이메일 인증 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("이메일 인증 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "이메일 인증 처리 중 오류가 발생했습니다."));
        }
    }
}
