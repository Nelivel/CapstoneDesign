package com.example.deskclean.dto;

import lombok.Data;

@Data
public class EjectionRequestDTO {

    private Long ejectionUid; // 추방할 유저

    // 관리자 uid는 토큰으로

    private String reason; // 추방 사유
}
