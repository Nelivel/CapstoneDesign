package com.example.deskclean.service;

import com.example.deskclean.domain.Enum.ReportStatus;
import com.example.deskclean.domain.Enum.Role;
import com.example.deskclean.domain.Enum.Status;
import com.example.deskclean.domain.User;
import com.example.deskclean.dto.Admin.DashboardStatsDTO;
import com.example.deskclean.dto.Admin.UserDetailDTO;
import com.example.deskclean.repository.ProductRepository;
import com.example.deskclean.repository.ReportRepository;
import com.example.deskclean.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReportRepository reportRepository;

    // 대시보드 통계 조회
    public DashboardStatsDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalActiveProducts = productRepository.countByStatus(Status.ON_SALE);
        long totalReports = reportRepository.count();
        long pendingReports = reportRepository.countByStatus(ReportStatus.RECEIVED);
        long suspendedUsers = userRepository.countBySuspendedStatus(true);

        return DashboardStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalActiveProducts(totalActiveProducts)
                .totalReports(totalReports)
                .pendingReports(pendingReports)
                .suspendedUsers(suspendedUsers)
                .build();
    }

    // 사용자 목록 조회 (페이징)
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    // 사용자 검색 (닉네임)
    public Page<User> searchUsersByNickname(String nickname, Pageable pageable) {
        return userRepository.findByNicknameContaining(nickname, pageable);
    }

    // 사용자 상세 정보 조회
    public Optional<UserDetailDTO> getUserDetail(Long userId) {
        return userRepository.findById(userId).map(user -> {
            long productCount = productRepository.countBySeller(user);
            long reportCount = reportRepository.countReportsByUser(userId);
            return UserDetailDTO.fromEntity(user, productCount, reportCount);
        });
    }

    // 사용자 정지
    @Transactional
    public boolean suspendUser(Long userId, String reason) {
        return userRepository.findById(userId).map(user -> {
            user.setIs_suspended(true);
            user.setSuspension_reason(reason);
            userRepository.save(user);
            return true;
        }).orElse(false);
    }

    // 사용자 정지 해제
    @Transactional
    public boolean unsuspendUser(Long userId) {
        return userRepository.findById(userId).map(user -> {
            user.setIs_suspended(false);
            user.setSuspension_reason(null);
            userRepository.save(user);
            return true;
        }).orElse(false);
    }

    // 사용자 역할 변경
    @Transactional
    public boolean changeUserRole(Long userId, Role role) {
        return userRepository.findById(userId).map(user -> {
            user.setRole(role);
            userRepository.save(user);
            return true;
        }).orElse(false);
    }

    // 관리자 권한 체크
    public boolean isAdmin(Long userId) {
        return userRepository.findById(userId)
                .map(user -> user.getRole() == Role.ADMIN)
                .orElse(false);
    }
}
