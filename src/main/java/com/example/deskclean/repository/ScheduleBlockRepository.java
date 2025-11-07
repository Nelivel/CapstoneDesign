package com.example.deskclean.repository;

import com.example.deskclean.domain.ScheduleBlock;
import com.example.deskclean.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScheduleBlockRepository extends JpaRepository<ScheduleBlock, Long> {
    // 특정 사용자의 모든 시간표 블록을 찾음
    List<ScheduleBlock> findAllByUser(User user);
}