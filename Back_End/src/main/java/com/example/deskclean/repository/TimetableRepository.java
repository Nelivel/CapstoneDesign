package com.example.deskclean.repository;

import com.example.deskclean.domain.Timetable;
import com.example.deskclean.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    
    // 사용자별 시간표 조회
    Optional<Timetable> findByUser(User user);
    
    // 사용자 ID로 시간표 조회
    Optional<Timetable> findByUser_Id(Long userId);
    
    // 사용자별 시간표 존재 여부 확인
    boolean existsByUser(User user);
}
