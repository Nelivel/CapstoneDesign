package com.example.deskclean.repository;

import com.example.deskclean.domain.Ejection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EjectionRepository extends JpaRepository<Ejection, Long> {

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Ejection e WHERE e.user_email = :email")
    boolean existsByUserEmail(@Param("email") String email);
}
