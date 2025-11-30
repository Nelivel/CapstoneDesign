package com.example.deskclean.service;

import com.example.deskclean.domain.Product;
import com.example.deskclean.domain.User;
import com.example.deskclean.repository.ProductRepository;
import com.example.deskclean.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Log4j2
public class HistoryService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * 판매 내역 조회
     */
    public List<Product> getSellHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // 판매자가 현재 사용자인 상품들
        return productRepository.findAll().stream()
                .filter(p -> p.getSeller() != null && p.getSeller().getId().equals(user.getId()))
                .toList();
    }

    /**
     * 구매 내역 조회
     */
    public List<Product> getBuyHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // 구매자가 현재 사용자인 상품들
        return productRepository.findAll().stream()
                .filter(p -> p.getBuyer() != null && p.getBuyer().getId().equals(user.getId()))
                .toList();
    }
}
