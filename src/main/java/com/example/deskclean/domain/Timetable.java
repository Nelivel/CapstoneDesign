package com.example.deskclean.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "timetable")
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user; // 시간표 주인

    // 월요일 시간표 (JSON 배열 형태로 저장)
    @Column(name = "monday", columnDefinition = "TEXT")
    private String monday; // 예: "[\"o\",\"o\",\"x\",\"x\",\"o\",\"o\",\"o\",\"x\",\"x\"]"

    // 화요일 시간표
    @Column(name = "tuesday", columnDefinition = "TEXT")
    private String tuesday;

    // 수요일 시간표
    @Column(name = "wednesday", columnDefinition = "TEXT")
    private String wednesday;

    // 목요일 시간표
    @Column(name = "thursday", columnDefinition = "TEXT")
    private String thursday;

    // 금요일 시간표
    @Column(name = "friday", columnDefinition = "TEXT")
    private String friday;
}
