package com.example.deskclean.service;

import com.example.deskclean.domain.Enum.Role;
import com.example.deskclean.domain.User;
import com.example.deskclean.dto.User.SignupRequestDTO;
import com.example.deskclean.dto.User.SignupResponseDTO;
import com.example.deskclean.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Log4j2
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    /**
     * 회원가입
     * @param requestDTO 회원가입 요청 정보
     * @return 가입된 사용자 정보
     * @throws IllegalArgumentException username 또는 nickname이 중복된 경우
     */
    @Transactional
    public SignupResponseDTO signup(SignupRequestDTO requestDTO) {
        // 1. username 중복 체크
        if (userRepository.existsByUsername(requestDTO.getUsername())) {
            log.warn("회원가입 실패: username 중복 - {}", requestDTO.getUsername());
            throw new IllegalArgumentException("이미 존재하는 사용자명입니다: " + requestDTO.getUsername());
        }

        // 2. nickname 중복 체크
        if (userRepository.existsByNickname(requestDTO.getNickname())) {
            log.warn("회원가입 실패: nickname 중복 - {}", requestDTO.getNickname());
            throw new IllegalArgumentException("이미 존재하는 닉네임입니다: " + requestDTO.getNickname());
        }

        // 3. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(requestDTO.getPassword());

        // 4. User 엔티티 생성 (기본값: USER role, 정지되지 않음, 삭제되지 않음)
        User user = User.builder()
                .username(requestDTO.getUsername())
                .password(encodedPassword)
                .nickname(requestDTO.getNickname())
                .email(requestDTO.getEmail()) // 회원가입 시 입력한 이메일
                .role(Role.USER) // 기본값은 일반 사용자
                .is_suspended(false)
                .is_deleted(false)
                .build();

        // 5. 저장
        User savedUser = userRepository.save(user);
        log.info("회원가입 성공: {} (ID: {})", savedUser.getUsername(), savedUser.getId());

        // 6. 이메일 인증 메일 발송
        
        try {
            emailService.sendEmailVerification(savedUser, requestDTO.getEmail());
            log.info("이메일 인증 메일 발송 성공: {}", requestDTO.getEmail());
        } catch (Exception e) {
            log.error("이메일 인증 메일 발송 실패: {}", requestDTO.getEmail(), e);
            // 이메일 발송 실패해도 회원가입은 성공으로 처리
        }
        
        log.warn("이메일 발송 기능이 비활성화되어 있습니다. SMTP 설정 후 활성화해주세요.");

        // 7. DTO 변환 후 반환
        return SignupResponseDTO.fromEntity(savedUser);
    }
}
