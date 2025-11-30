package com.example.deskclean.config;

import com.example.deskclean.domain.User;
import com.example.deskclean.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // user1 (비번: 1234) 생성
        if (userRepository.findByUsername("user1").isEmpty()) {
            User user1 = new User();
            user1.setUsername("user1");
            user1.setPassword(passwordEncoder.encode("1234"));
            user1.setNickname("Tester1");
            userRepository.save(user1);
        }
        
        // user2 (비번: 1234) 생성
        if (userRepository.findByUsername("user2").isEmpty()) {
            User user2 = new User();
            user2.setUsername("user2");
            user2.setPassword(passwordEncoder.encode("1234"));
            user2.setNickname("Tester2");
            userRepository.save(user2);
        }
    }
}