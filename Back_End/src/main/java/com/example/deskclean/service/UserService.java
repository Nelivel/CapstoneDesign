package com.example.deskclean.service;

import com.example.deskclean.domain.User;
import com.example.deskclean.dto.User.*;
import com.example.deskclean.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Log4j2
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 프로필 수정 (닉네임 변경)
     * @param username 현재 로그인한 사용자명
     * @param requestDTO 프로필 수정 요청 정보
     * @return 수정된 사용자 정보
     * @throws UsernameNotFoundException 사용자를 찾을 수 없는 경우
     * @throws IllegalArgumentException 닉네임이 중복된 경우
     */
    @Transactional
    public ProfileUpdateResponseDTO updateProfile(String username, ProfileUpdateRequestDTO requestDTO) {
        // 1. 사용자 조회
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // 2. 새 닉네임이 다른 사용자와 중복되지 않는지 체크
        if (!user.getNickname().equals(requestDTO.getNickname()) &&
            userRepository.existsByNicknameAndNotUserId(requestDTO.getNickname(), user.getId())) {
            log.warn("프로필 수정 실패: 닉네임 중복 - {} (사용자: {})", requestDTO.getNickname(), username);
            throw new IllegalArgumentException("이미 존재하는 닉네임입니다: " + requestDTO.getNickname());
        }

        // 3. 닉네임 업데이트
        user.setNickname(requestDTO.getNickname());
        User savedUser = userRepository.save(user);

        log.info("프로필 수정 성공: {} (새 닉네임: {})", username, requestDTO.getNickname());
        return ProfileUpdateResponseDTO.fromEntity(savedUser);
    }

    /**
     * 비밀번호 변경
     * @param username 현재 로그인한 사용자명
     * @param requestDTO 비밀번호 변경 요청 정보
     * @return 성공 메시지
     * @throws UsernameNotFoundException 사용자를 찾을 수 없는 경우
     * @throws IllegalArgumentException 현재 비밀번호가 틀렸거나 새 비밀번호 확인이 일치하지 않는 경우
     */
    @Transactional
    public PasswordChangeResponseDTO changePassword(String username, PasswordChangeRequestDTO requestDTO) {
        // 1. 사용자 조회
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // 2. 현재 비밀번호 검증 (보안상 매우 중요!)
        if (!passwordEncoder.matches(requestDTO.getCurrentPassword(), user.getPassword())) {
            log.warn("비밀번호 변경 실패: 현재 비밀번호 불일치 (사용자: {})", username);
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 3. 새 비밀번호와 확인 비밀번호 일치 여부 체크
        if (!requestDTO.getNewPassword().equals(requestDTO.getNewPasswordConfirm())) {
            log.warn("비밀번호 변경 실패: 새 비밀번호 확인 불일치 (사용자: {})", username);
            throw new IllegalArgumentException("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        }

        // 4. 새 비밀번호 암호화 및 업데이트
        String encodedNewPassword = passwordEncoder.encode(requestDTO.getNewPassword());
        user.setPassword(encodedNewPassword);
        userRepository.save(user);

        log.info("비밀번호 변경 성공: {}", username);
        return new PasswordChangeResponseDTO("비밀번호가 성공적으로 변경되었습니다.");
    }

    /**
     * 회원 탈퇴 (Soft Delete)
     * @param username 현재 로그인한 사용자명
     * @param requestDTO 회원 탈퇴 요청 정보 (비밀번호 확인)
     * @return 성공 메시지
     * @throws UsernameNotFoundException 사용자를 찾을 수 없는 경우
     * @throws IllegalArgumentException 비밀번호가 틀린 경우
     */
    @Transactional
    public AccountDeleteResponseDTO deleteAccount(String username, AccountDeleteRequestDTO requestDTO) {
        // 1. 사용자 조회
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // 2. 비밀번호 검증 (보안상 매우 중요!)
        if (!passwordEncoder.matches(requestDTO.getPassword(), user.getPassword())) {
            log.warn("회원 탈퇴 실패: 비밀번호 불일치 (사용자: {})", username);
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 3. Soft Delete 처리
        user.setIs_deleted(true);
        user.setDeleted_at(LocalDateTime.now());
        userRepository.save(user);

        // 4. 로그아웃 처리 (SecurityContext 초기화)
        SecurityContextHolder.clearContext();

        log.info("회원 탈퇴 성공: {} (탈퇴 시각: {})", username, user.getDeleted_at());
        return new AccountDeleteResponseDTO("회원 탈퇴가 완료되었습니다.");
    }

    /**
     * username으로 사용자 조회
     * @param username 사용자명
     * @return User 엔티티
     * @throws UsernameNotFoundException 사용자를 찾을 수 없는 경우
     */
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));
    }
}
