package com.example.deskclean.controller;

import com.example.deskclean.domain.User;
import com.example.deskclean.dto.Admin.*;
import com.example.deskclean.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    // TODO: JWT 인증 구현 필요
    // 현재는 임시로 admin_id를 하드코딩

    // ===== 대시보드 =====

    /**
     * 관리자 대시보드 통계 조회
     * GET /api/admin/dashboard/stats
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(
            @RequestHeader(value = "Authorization", required = false) String token) {

        // TODO: JWT에서 admin_id 추출 및 권한 체크
        Long adminId = 1L;

        if (!adminService.isAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        DashboardStatsDTO stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // ===== 사용자 관리 =====

    /**
     * 사용자 목록 조회 (페이징)
     * GET /api/admin/users?page=0&size=10
     */
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // TODO: JWT에서 admin_id 추출 및 권한 체크
        Long adminId = 1L;

        if (!adminService.isAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<User> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * 사용자 검색 (닉네임)
     * GET /api/admin/users/search?nickname=홍길동&page=0&size=10
     */
    @GetMapping("/users/search")
    public ResponseEntity<Page<User>> searchUsers(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam String nickname,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // TODO: JWT에서 admin_id 추출 및 권한 체크
        Long adminId = 1L;

        if (!adminService.isAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<User> users = adminService.searchUsersByNickname(nickname, pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * 사용자 상세 정보 조회
     * GET /api/admin/users/{userId}
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDetailDTO> getUserDetail(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long userId) {

        // TODO: JWT에서 admin_id 추출 및 권한 체크
        Long adminId = 1L;

        if (!adminService.isAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return adminService.getUserDetail(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ===== 사용자 정지/해제 =====

    /**
     * 사용자 정지
     * POST /api/admin/users/{userId}/suspend
     */
    @PostMapping("/users/{userId}/suspend")
    public ResponseEntity<Map<String, String>> suspendUser(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long userId,
            @Valid @RequestBody UserSuspendRequestDTO request) {

        // TODO: JWT에서 admin_id 추출 및 권한 체크
        Long adminId = 1L;

        if (!adminService.isAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean success = adminService.suspendUser(userId, request.getReason());

        Map<String, String> response = new HashMap<>();
        if (success) {
            response.put("result", "success");
            response.put("message", "사용자가 정지되었습니다.");
            return ResponseEntity.ok(response);
        } else {
            response.put("result", "error");
            response.put("message", "사용자를 찾을 수 없습니다.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * 사용자 정지 해제
     * POST /api/admin/users/{userId}/unsuspend
     */
    @PostMapping("/users/{userId}/unsuspend")
    public ResponseEntity<Map<String, String>> unsuspendUser(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long userId) {

        // TODO: JWT에서 admin_id 추출 및 권한 체크
        Long adminId = 1L;

        if (!adminService.isAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean success = adminService.unsuspendUser(userId);

        Map<String, String> response = new HashMap<>();
        if (success) {
            response.put("result", "success");
            response.put("message", "사용자 정지가 해제되었습니다.");
            return ResponseEntity.ok(response);
        } else {
            response.put("result", "error");
            response.put("message", "사용자를 찾을 수 없습니다.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // ===== 사용자 역할 변경 =====

    /**
     * 사용자 역할 변경 (USER <-> ADMIN)
     * PUT /api/admin/users/{userId}/role
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<Map<String, String>> changeUserRole(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long userId,
            @Valid @RequestBody UserRoleChangeRequestDTO request) {

        // TODO: JWT에서 admin_id 추출 및 권한 체크
        Long adminId = 1L;

        if (!adminService.isAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean success = adminService.changeUserRole(userId, request.getRole());

        Map<String, String> response = new HashMap<>();
        if (success) {
            response.put("result", "success");
            response.put("message", "사용자 역할이 변경되었습니다.");
            return ResponseEntity.ok(response);
        } else {
            response.put("result", "error");
            response.put("message", "사용자를 찾을 수 없습니다.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}

// TODO
// - JWT 인증 구현
// - 관리자 권한 체크를 AOP나 Interceptor로 분리
// - Custom Exception 처리
