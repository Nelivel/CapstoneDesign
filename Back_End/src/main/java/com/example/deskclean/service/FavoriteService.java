package com.example.deskclean.service;

import com.example.deskclean.domain.Favorite;
import com.example.deskclean.domain.Product;
import com.example.deskclean.domain.User;
import com.example.deskclean.repository.FavoriteRepository;
import com.example.deskclean.repository.ProductRepository;
import com.example.deskclean.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Log4j2
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    /**
     * 사용자의 즐겨찾기 목록 조회
     */
    public List<Product> getFavorites(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        List<Favorite> favorites = favoriteRepository.findByUser(user);

        return favorites.stream()
                .map(Favorite::getProduct)
                .collect(Collectors.toList());
    }

    /**
     * 즐겨찾기 추가
     */
    @Transactional
    public void addFavorite(String username, Long productId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + productId));

        // 이미 존재하는지 확인
        if (favoriteRepository.existsByUserAndProduct(user, product)) {
            log.warn("이미 즐겨찾기에 추가된 상품입니다: userId={}, productId={}", user.getId(), productId);
            return; // 중복이면 그냥 성공으로 처리
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setProduct(product);

        favoriteRepository.save(favorite);
        log.info("즐겨찾기 추가 성공: userId={}, productId={}", user.getId(), productId);
    }

    /**
     * 즐겨찾기 삭제
     */
    @Transactional
    public void removeFavorite(String username, Long productId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + productId));

        favoriteRepository.deleteByUserAndProduct(user, product);
        log.info("즐겨찾기 삭제 성공: userId={}, productId={}", user.getId(), productId);
    }
}
