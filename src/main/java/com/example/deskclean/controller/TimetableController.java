package com.example.deskclean.controller;

import com.example.deskclean.domain.User;
import com.example.deskclean.dto.TimetableRecommendationResponse; // [수정] DTO 임포트
import com.example.deskclean.repository.UserRepository;
import com.example.deskclean.service.TimetableService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import java.security.Principal;
// import java.util.Map; // Map 대신 DTO 사용

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableService timetableService;
    private final UserRepository userRepository;

    public TimetableController(TimetableService timetableService, UserRepository userRepository) {
        this.timetableService = timetableService;
        this.userRepository = userRepository;
    }

    // AI 팀을 위한 2D 리스트 반환 API
    @GetMapping("/ai")
    public ResponseEntity<List<List<String>>> getAITimetable(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        List<List<String>> aiTimetable = timetableService.getTimetableForAI(user);
        return ResponseEntity.ok(aiTimetable);
    }

    // [수정] 프론트엔드를 위한 최종 추천 결과 반환 API
    @GetMapping("/recommend/{otherUserId}")
    public ResponseEntity<TimetableRecommendationResponse> getRecommendation(@PathVariable Long otherUserId, Principal principal) {
        
        User user1 = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("본인 정보를 찾을 수 없습니다."));
        User user2 = userRepository.findById(otherUserId)
                .orElseThrow(() -> new IllegalArgumentException("상대방 정보를 찾을 수 없습니다."));

        // 서비스의 getRecommendation 메소드 호출
        TimetableRecommendationResponse response = timetableService.getRecommendation(user1, user2);
            
        return ResponseEntity.ok(response);
    }
    
    // [신규] 시간표 저장/수정 API
    @PostMapping("/save")
    public ResponseEntity<String> saveTimetable(@RequestBody List<List<String>> timetableData, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // 데이터 검증
        if (timetableData.size() != 5) {
            return ResponseEntity.badRequest().body("시간표는 월화수목금 5개 요일이어야 합니다.");
        }
        
        for (List<String> day : timetableData) {
            if (day.size() != 9) {
                return ResponseEntity.badRequest().body("각 요일은 9개 교시여야 합니다.");
            }
            for (String period : day) {
                if (!period.equals("o") && !period.equals("x")) {
                    return ResponseEntity.badRequest().body("각 교시는 'o' 또는 'x'여야 합니다.");
                }
            }
        }
        
        timetableService.saveTimetable(user, timetableData);
        return ResponseEntity.ok("시간표가 저장되었습니다.");
    }
    
    // [신규] 시간표 삭제 API
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteTimetable(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        timetableService.deleteTimetable(user);
        return ResponseEntity.ok("시간표가 삭제되었습니다.");
    }
}