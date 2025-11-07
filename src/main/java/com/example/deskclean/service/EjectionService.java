package com.example.deskclean.service;

import com.example.deskclean.domain.Ejection;
import com.example.deskclean.domain.User;
import com.example.deskclean.repository.EjectionRepository;
import com.example.deskclean.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EjectionService {

    // 유저 추방
    @Autowired
    private EjectionRepository ejectionRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Ejection ejectUser(Long ejectionUid, Long adminUid, String reason) {

        User ejectionUser = userRepository.findById(ejectionUid)
                .orElseThrow(() -> new RuntimeException("User not found " + ejectionUid));

        User adminUser = userRepository.findById(adminUid)
                .orElseThrow(() -> new RuntimeException("User not found " + adminUid));

        // User 엔티티에 email 필드가 없으므로 username을 사용
        Ejection ejection = Ejection.builder()
                .ejection_uid(ejectionUser)
                .admin_uid(adminUser)
                .ejected_reason(reason)
                .user_email(ejectionUser.getUsername()) // email 대신 username 사용
                .build();

        // 추방 정보 저장
        ejectionRepository.save(ejection);

        // 유저 삭제 처리
        userRepository.delete(ejectionUser);

        return ejection;
    }
}
