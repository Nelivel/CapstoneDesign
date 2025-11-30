package com.example.deskclean.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalTime;

@Getter
@Setter
@Entity
public class ScheduleBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 이 시간표의 주인

    @Column(nullable = false)
    private String subjectName; // 예: "알고리즘"

    @Column(nullable = false)
    private String dayOfWeek; // "월", "화", "수", "목", "금"

    @Column(nullable = false)
    private LocalTime startTime; // 예: 09:30:00

    @Column(nullable = false)
    private LocalTime endTime; // 예: 11:00:00
}