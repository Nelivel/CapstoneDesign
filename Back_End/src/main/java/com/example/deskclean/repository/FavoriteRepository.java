package com.example.deskclean.repository;

import com.example.deskclean.domain.Favorite;
import com.example.deskclean.domain.User;
import com.example.deskclean.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUser(User user);

    Optional<Favorite> findByUserAndProduct(User user, Product product);

    boolean existsByUserAndProduct(User user, Product product);

    void deleteByUserAndProduct(User user, Product product);
}
