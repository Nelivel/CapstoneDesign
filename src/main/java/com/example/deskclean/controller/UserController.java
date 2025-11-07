package com.example.deskclean.controller;

import com.example.deskclean.dto.User.*;
import com.example.deskclean.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Log4j2
public class UserController {
    private final UserService userService;

    /**
     * 프로필 수정 API
     * PUT /api/users/profile
     * 인증된 사용자만 자신의 프로필을 수정할 수 있음
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProfileUpdateRequestDTO requestDTO,
            BindingResult bindingResult) {

        // 1. 입력값 검증 오류 처리
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            // 2. 현재 로그인한 사용자명 추출
            String username = userDetails.getUsername();

            // 3. 프로필 수정 처리
            ProfileUpdateResponseDTO responseDTO = userService.updateProfile(username, requestDTO);

            log.info("프로필 수정 API 성공: {}", username);
            return ResponseEntity.ok(responseDTO);

        } catch (IllegalArgumentException e) {
            // 4. 닉네임 중복 등의 비즈니스 로직 오류 처리
            log.warn("프로필 수정 실패: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            // 5. 예상치 못한 오류 처리
            log.error("프로필 수정 중 예상치 못한 오류 발생", e);

            Map<String, String> error = new HashMap<>();
            error.put("error", "프로필 수정 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * 비밀번호 변경 API
     * PUT /api/users/password
     * 인증된 사용자만 자신의 비밀번호를 변경할 수 있음
     */
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PasswordChangeRequestDTO requestDTO,
            BindingResult bindingResult) {

        // 1. 입력값 검증 오류 처리
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            // 2. 현재 로그인한 사용자명 추출
            String username = userDetails.getUsername();

            // 3. 비밀번호 변경 처리
            PasswordChangeResponseDTO responseDTO = userService.changePassword(username, requestDTO);

            log.info("비밀번호 변경 API 성공: {}", username);
            return ResponseEntity.ok(responseDTO);

        } catch (IllegalArgumentException e) {
            // 4. 현재 비밀번호 불일치 등의 비즈니스 로직 오류 처리
            log.warn("비밀번호 변경 실패: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            // 5. 예상치 못한 오류 처리
            log.error("비밀번호 변경 중 예상치 못한 오류 발생", e);

            Map<String, String> error = new HashMap<>();
            error.put("error", "비밀번호 변경 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * 회원 탈퇴 API
     * DELETE /api/users/account
     * 인증된 사용자만 자신의 계정을 탈퇴할 수 있음
     */
    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AccountDeleteRequestDTO requestDTO,
            BindingResult bindingResult) {

        // 1. 입력값 검증 오류 처리
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            // 2. 현재 로그인한 사용자명 추출
            String username = userDetails.getUsername();

            // 3. 회원 탈퇴 처리
            AccountDeleteResponseDTO responseDTO = userService.deleteAccount(username, requestDTO);

            log.info("회원 탈퇴 API 성공: {}", username);
            return ResponseEntity.ok(responseDTO);

        } catch (IllegalArgumentException e) {
            // 4. 비밀번호 불일치 등의 비즈니스 로직 오류 처리
            log.warn("회원 탈퇴 실패: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            // 5. 예상치 못한 오류 처리
            log.error("회원 탈퇴 중 예상치 못한 오류 발생", e);

            Map<String, String> error = new HashMap<>();
            error.put("error", "회원 탈퇴 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
