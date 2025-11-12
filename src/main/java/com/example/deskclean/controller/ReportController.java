package com.example.deskclean.controller;

import com.example.deskclean.dto.Report.*;
import com.example.deskclean.dto.paging.PageResponseDTO;
import com.example.deskclean.service.ReportService;
import com.example.deskclean.util.EnumCastingUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Log4j2
public class ReportController {
   private final ReportService reportService;
   // TODO: JWTUtil 구현 필요
   // private final JWTUtil jwtUtil;

   @Autowired
   private EnumCastingUtil enumCastingUtil;

   // ===== 새로운 신고 API =====

   // 상품 신고
   @PostMapping("/products")
   public ResponseEntity<ReportProductResponseDTO> createProductReport(
           @RequestHeader(value = "Authorization", required = false) String token,
           @RequestBody ReportProductRequestDTO reportProductRequestDTO) {

       // TODO: JWT 토큰에서 user_id 추출 로직 구현 필요
       // Long reporter_id = getUserIdFromToken(token);
       Long reporter_id = 1L; // 임시 하드코딩

       ReportProductResponseDTO responseDTO = reportService.createProductReport(reporter_id, reportProductRequestDTO);

       return ResponseEntity.ok(responseDTO);
   }

   // 사용자 신고
   @PostMapping("/users")
   public ResponseEntity<ReportUserResponseDTO> createUserReport(
           @RequestHeader(value = "Authorization", required = false) String token,
           @RequestBody ReportUserRequestDTO reportUserRequestDTO) {

       // TODO: JWT 토큰에서 user_id 추출 로직 구현 필요
       // Long reporter_id = getUserIdFromToken(token);
       Long reporter_id = 1L; // 임시 하드코딩

       ReportUserResponseDTO responseDTO = reportService.createUserReport(reporter_id, reportUserRequestDTO);

       return ResponseEntity.ok(responseDTO);
   }

   // 메시지 신고
   @PostMapping("/messages")
   public ResponseEntity<ReportMessageResponseDTO> createMessageReport(
           @RequestHeader(value = "Authorization", required = false) String token,
           @RequestBody ReportMessageRequestDTO reportMessageRequestDTO) {

       // TODO: JWT 토큰에서 user_id 추출 로직 구현 필요
       // Long reporter_id = getUserIdFromToken(token);
       Long reporter_id = 1L; // 임시 하드코딩

       ReportMessageResponseDTO responseDTO = reportService.createMessageReport(reporter_id, reportMessageRequestDTO);

       return ResponseEntity.ok(responseDTO);
   }

   // ===== 기존 Post/Reply 신고 API (사용 안 함 - 커뮤니티 게시판 제거됨) =====
   // 삭제 예정: /posts, /replies 엔드포인트

   // 신고 상태 변경
   @PutMapping("/status/{report_id}")
   public ResponseEntity<Map<String, String>> updateReportStatus(
           @RequestHeader(value = "Authorization", required = false) String token,
           @PathVariable("report_id") Long report_id)
   {
       // TODO: JWT 토큰에서 admin_id 추출 로직 구현 필요
       // Long admin_id = getUserIdFromToken(token);
       Long admin_id = 1L; // 임시 하드코딩

       // 정상 실행시
       try {
           reportService.updateReportStatus(report_id, admin_id);

           Map<String, String> response = new HashMap<>();
           response.put("result", "success");

           return new ResponseEntity<>(response, HttpStatus.OK);

       } catch (IllegalArgumentException e) {

           Map<String, String> response = new HashMap<>();
           response.put("result", "error");

           return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
       } catch (Exception e) {
           Map<String, String> response = new HashMap<>();
           response.put("result", "error");

           return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
       }
   }

   @PostMapping("/paging")
   public ResponseEntity<?> pagingReportList(@RequestBody ReportPagingRequestDTO pagingRequestDTO){
       PageResponseDTO pages = reportService.reportPaging(pagingRequestDTO);
       return ResponseEntity.ok(pages);
   }

   // TODO: JWTUtil 구현 후 주석 해제
   /*
   // Helper method: JWT 토큰에서 user_id 추출
   private Long getUserIdFromToken(String token) {
       if (token == null || !token.startsWith("Bearer ")) {
           throw new IllegalArgumentException("Invalid token format");
       }

       String accessToken = token.substring(7);

       try {
           Map<String, Object> claims = jwtUtil.validateToken(accessToken);
           String userId = claims.get("user_id").toString();
           return Long.parseLong(userId);
       } catch (Exception e) {
           log.error("Failed to extract user_id from token: " + e.getMessage());
           throw new IllegalArgumentException("Invalid token: " + e.getMessage());
       }
   }
   */
}
