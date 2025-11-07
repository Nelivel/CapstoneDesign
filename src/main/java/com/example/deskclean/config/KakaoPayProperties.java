package com.example.deskclean.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "kakao.pay")
public class KakaoPayProperties {
    private String cid;
    private String secretKey;
    private String readyUrl;
    private String approveUrl;
    private String successUrl;
    private String cancelUrl;
    private String failUrl;

    // getters/setters
    public String getCid() { return cid; }
    public void setCid(String cid) { this.cid = cid; }
    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
    public String getReadyUrl() { return readyUrl; }
    public void setReadyUrl(String readyUrl) { this.readyUrl = readyUrl; }
    public String getApproveUrl() { return approveUrl; }
    public void setApproveUrl(String approveUrl) { this.approveUrl = approveUrl; }
    public String getSuccessUrl() { return successUrl; }
    public void setSuccessUrl(String successUrl) { this.successUrl = successUrl; }
    public String getCancelUrl() { return cancelUrl; }
    public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }
    public String getFailUrl() { return failUrl; }
    public void setFailUrl(String failUrl) { this.failUrl = failUrl; }
}