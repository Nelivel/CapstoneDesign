package com.example.deskclean.dto.Admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalUsers;           // 전체 사용자 수
    private long totalProducts;        // 전체 상품 수
    private long totalActiveProducts;  // 판매중인 상품 수
    private long totalReports;         // 전체 신고 수
    private long pendingReports;       // 처리 대기중인 신고 수
    private long suspendedUsers;       // 정지된 사용자 수
}
