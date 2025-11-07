package com.example.deskclean.controller;

import com.example.deskclean.dto.User.SignupRequestDTO;
import com.example.deskclean.dto.User.SignupResponseDTO;
import com.example.deskclean.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
}
