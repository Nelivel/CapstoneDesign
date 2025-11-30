package com.example.deskclean.service;

import com.example.deskclean.domain.User;
import com.example.deskclean.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. UserRepository를 사용해 DB에서 사용자를 찾기.
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // 2. 탈퇴한 사용자 체크
        if (user.getIs_deleted() != null && user.getIs_deleted()) {
            throw new UsernameNotFoundException("탈퇴한 사용자입니다.");
        }

        // 3. 정지된 사용자 체크
        if (user.getIs_suspended() != null && user.getIs_suspended()) {
            throw new UsernameNotFoundException("정지된 사용자입니다. 사유: " + user.getSuspension_reason());
        }

        // 4. Spring Security가 이해할 수 있는 UserDetails 객체로 변환.
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                new ArrayList<>() // (권한 목록 지금은 뭐 없음)
        );
    }
}