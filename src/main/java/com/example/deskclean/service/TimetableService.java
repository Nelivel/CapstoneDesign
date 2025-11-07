package com.example.deskclean.service;

import com.example.deskclean.domain.Timetable;
import com.example.deskclean.domain.User;
import com.example.deskclean.repository.TimetableRepository;
import com.example.deskclean.dto.TimetableRecommendationResponse;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private static final int PERIODS_PER_DAY = 9; // 1교시부터 9교시까지
    private final Gson gson = new Gson();

    public TimetableService(TimetableRepository timetableRepository) {
        this.timetableRepository = timetableRepository;
    }

    // [수정] DTO 클래스를 내부 정적 클래스로 정의 (시간 계산용)
    @Getter
    @AllArgsConstructor
    public static class RecommendedTimeSlot {
        private String dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private long durationInMinutes;

        public RecommendedTimeSlot(String day, LocalTime start, LocalTime end) {
            this.dayOfWeek = day;
            this.startTime = start;
            this.endTime = end;
            this.durationInMinutes = ChronoUnit.MINUTES.between(start, end);
        }

        // "1. 화요일 1교시-3교시 (2시간)" 형식으로 변환
        public String toFormattedString(int rank) {
            return String.format("%d. %s요일 %d교시-%d교시 (%d시간)",
                    rank,
                    this.dayOfWeek,
                    timeToPeriod(this.startTime) + 1, // 0교시를 1교시로 표시
                    timeToPeriod(this.endTime) + 1,   // 0교시를 1교시로 표시
                    this.durationInMinutes / 60      // 분을 시간으로 변환
            );
        }
        
        // 시간을 교시로 변환하는 헬퍼 메서드
        private int timeToPeriod(LocalTime time) {
            int hour = time.getHour();
            if (hour >= 9 && hour <= 17) {
                return hour - 9; // 9시=0교시(1교시), 10시=1교시(2교시), ...
            }
            return -1;
        }
    }

    // [수정] DB에서 직접 시간표 배열 조회
    public List<List<String>> getTimetableForAI(User user) {
        Timetable timetable = timetableRepository.findByUser(user).orElse(null);
        if (timetable == null) {
            // 시간표가 없으면 빈 시간표 반환
            return createEmptyTimetable();
        }

        List<List<String>> aiTimetable = new ArrayList<>();
        
        // JSON 문자열을 List<String>으로 변환
        aiTimetable.add(parseJsonToList(timetable.getMonday()));
        aiTimetable.add(parseJsonToList(timetable.getTuesday()));
        aiTimetable.add(parseJsonToList(timetable.getWednesday()));
        aiTimetable.add(parseJsonToList(timetable.getThursday()));
        aiTimetable.add(parseJsonToList(timetable.getFriday()));
        
        return aiTimetable;
    }
    
    // JSON 문자열을 List<String>으로 변환
    private List<String> parseJsonToList(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return createEmptyDay();
        }
        try {
            return gson.fromJson(jsonString, new TypeToken<List<String>>(){}.getType());
        } catch (Exception e) {
            return createEmptyDay();
        }
    }
    
    // 빈 시간표 생성
    private List<List<String>> createEmptyTimetable() {
        List<List<String>> emptyTimetable = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            emptyTimetable.add(createEmptyDay());
        }
        return emptyTimetable;
    }
    
    // 빈 하루 생성
    private List<String> createEmptyDay() {
        List<String> emptyDay = new ArrayList<>();
        for (int i = 0; i < PERIODS_PER_DAY; i++) {
            emptyDay.add("x");
        }
        return emptyDay;
    }

    // [수정] 시간표 등록 여부 확인
    public boolean hasTimetable(User user) {
        return timetableRepository.existsByUser(user);
    }

    // [수정] 공통 공백 시간 찾기 (1-9교시 형식)
    public List<RecommendedTimeSlot> findCommonFreeTimeSlots(User user1, User user2) {
        List<List<String>> table1 = getTimetableForAI(user1);
        List<List<String>> table2 = getTimetableForAI(user2);
        List<RecommendedTimeSlot> recommendations = new ArrayList<>();

        for (int i = 0; i < 5; i++) { // 0=월, 1=화, ... 
            String day = indexToDay(i);
            List<String> day1 = table1.get(i);
            List<String> day2 = table2.get(i);
            LocalTime periodStartTime = null;
            
            for (int j = 0; j < PERIODS_PER_DAY; j++) {
                boolean isCommonFree = day1.get(j).equals("x") && day2.get(j).equals("x");

                if (isCommonFree) {
                    if (periodStartTime == null) periodStartTime = periodToTime(j);
                } else {
                    if (periodStartTime != null) {
                        recommendations.add(new RecommendedTimeSlot(day, periodStartTime, periodToTime(j)));
                        periodStartTime = null;
                    }
                }
            }
            if (periodStartTime != null) {
                recommendations.add(new RecommendedTimeSlot(day, periodStartTime, periodToTime(PERIODS_PER_DAY)));
            }
        }
        return recommendations;
    }
    
    // [신규] 시간표 저장/수정
    public void saveTimetable(User user, List<List<String>> timetableData) {
        Timetable timetable = timetableRepository.findByUser(user).orElse(new Timetable());
        timetable.setUser(user);
        
        // List<List<String>>을 JSON 문자열로 변환하여 저장
        timetable.setMonday(gson.toJson(timetableData.get(0)));
        timetable.setTuesday(gson.toJson(timetableData.get(1)));
        timetable.setWednesday(gson.toJson(timetableData.get(2)));
        timetable.setThursday(gson.toJson(timetableData.get(3)));
        timetable.setFriday(gson.toJson(timetableData.get(4)));
        
        timetableRepository.save(timetable);
    }
    
    // [신규] 시간표 삭제
    public void deleteTimetable(User user) {
        timetableRepository.findByUser(user).ifPresent(timetableRepository::delete);
    }

    // [신규] 사용자가 요청한 최종 포맷으로 응답 생성
    public TimetableRecommendationResponse getRecommendation(User user1, User user2) {
        // 1. 두 사용자 모두 시간표를 입력했는지 판단
        if (!hasTimetable(user1)) {
            return TimetableRecommendationResponse.builder()
                    .message("본인의 시간표가 입력되지 않아 비교할 수 없습니다.")
                    .top3Recommendations(List.of())
                    .build();
        }
        if (!hasTimetable(user2)) {
            return TimetableRecommendationResponse.builder()
                    .message("상대방의 시간표가 입력되지 않아 비교할 수 없습니다.")
                    .top3Recommendations(List.of())
                    .build();
        }

        // 2. 공통 빈 시간 계산
        List<RecommendedTimeSlot> allSlots = findCommonFreeTimeSlots(user1, user2);
        
        if (allSlots.isEmpty()) {
            return TimetableRecommendationResponse.builder()
                    .message("✅ 아쉽지만, 공통 빈 시간이 없습니다.")
                    .top3Recommendations(List.of())
                    .build();
        }

        // 3. 공통 빈 시간을 긴 시간 순서로 정렬 (TOP 3)
        allSlots.sort(Comparator.comparing(RecommendedTimeSlot::getDurationInMinutes).reversed());

        // 4. 문자열 포맷팅
        List<String> top3Strings = new ArrayList<>();
        for (int i = 0; i < Math.min(3, allSlots.size()); i++) {
            top3Strings.add(allSlots.get(i).toFormattedString(i + 1));
        }

        // 5. 최종 응답 객체 생성
        return TimetableRecommendationResponse.builder()
                .message(String.format("✅ 총 %d개의 공통 빈 시간을 찾았습니다.", allSlots.size()))
                .top3Recommendations(top3Strings)
                .build();
    }

    private int dayToIndex(String day) {
        switch (day) {
            case "월": return 0;
            case "화": return 1;
            case "수": return 2;
            case "목": return 3;
            case "금": return 4;
            default: return -1;
        }
    }

    private String indexToDay(int index) {
        switch (index) {
            case 0: return "월";
            case 1: return "화";
            case 2: return "수";
            case 3: return "목";
            case 4: return "금";
            default: return "??";
        }
    }

    // [수정] 시간을 교시로 변환 (1교시=9:00, 2교시=10:00, ...)
    private int timeToPeriod(LocalTime time) {
        int hour = time.getHour();
        if (hour >= 9 && hour <= 17) {
            return hour - 9; // 9시=0교시(1교시), 10시=1교시(2교시), ...
        }
        return -1; // 유효하지 않은 시간
    }
    
    // [수정] 교시를 시간으로 변환
    private LocalTime periodToTime(int period) {
        return LocalTime.of(9 + period, 0); // 1교시=9:00, 2교시=10:00, ...
    }
}