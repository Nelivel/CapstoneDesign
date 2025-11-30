package com.example.deskclean.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KakaoReadyResponse {

    private String tid;  // 결제 고유번호
    private String next_redirect_pc_url;     // PC 결제창 URL
    private String next_redirect_mobile_url; // 모바일 결제창 URL
    private String next_redirect_app_url;    // 앱 결제창 URL
    private String android_app_scheme;
    private String ios_app_scheme;
    private String created_at;
}
