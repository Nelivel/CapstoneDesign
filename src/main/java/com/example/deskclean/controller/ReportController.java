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

   // post 신고하기
   @PostMapping("/posts")
   public ResponseEntity<ReportPostResponseDTO> createPostReport(
           @RequestHeader(value = "Authorization", required = false) String token,
           @RequestBody ReportPostRequestDTO reportPostRequestDTO) {

       // TODO: JWT 토큰에서 user_id 추출 로직 구현 필요
       // Long reporter_id = getUserIdFromToken(token);
       Long reporter_id = 1L; // 임시 하드코딩

       ReportPostResponseDTO responseDTO = reportService.createPostReport(reporter_id, reportPostRequestDTO);

       return ResponseEntity.ok(responseDTO);
   }

   // 신고_댓글_매핑
   @PostMapping("/replies")
   public ResponseEntity<ReportReplyResponseDTO> createReplyReport(
           @RequestHeader(value = "Authorization", required = false) String token,
           @RequestBody ReportReplyRequestDTO reportReplyRequestDTO) {

       // TODO: JWT 토큰에서 user_id 추출 로직 구현 필요
       // Long reporter_id = getUserIdFromToken(token);
       Long reporter_id = 1L; // 임시 하드코딩

       ReportReplyResponseDTO responseDTO = reportService.createReplyReport(reporter_id, reportReplyRequestDTO);

       return ResponseEntity.ok(responseDTO);
   }

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
