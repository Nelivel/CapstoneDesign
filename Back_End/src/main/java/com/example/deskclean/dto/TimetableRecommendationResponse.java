package com.example.deskclean.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class TimetableRecommendationResponse {
    private String message; // 예: "✅ 총 13개의 공통 빈 시간을 찾았습니다."
    private List<String> top3Recommendations; // 예: ["1. 화요일 13:00-17:00 (240분)", "2. ..."]
}