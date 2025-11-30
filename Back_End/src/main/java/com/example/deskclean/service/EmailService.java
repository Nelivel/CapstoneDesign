package com.example.deskclean.service;

import com.example.deskclean.domain.EmailVerificationToken;
import com.example.deskclean.domain.User;
import com.example.deskclean.repository.EmailVerificationTokenRepository;
import com.example.deskclean.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Log4j2
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.verification.url}")
    private String emailVerificationUrl;

    @Value("${app.email.school-verification.url}")
    private String schoolVerificationUrl;

    /**
     * 1차 이메일 인증 메일 발송
     */
    @Transactional
    public void sendEmailVerification(User user, String email) {
        try {
            // 기존 미사용 토큰 삭제
            tokenRepository.findByUserAndTokenType(user, "EMAIL").forEach(token -> {
                if (!token.getUsed()) {
                    tokenRepository.delete(token);
                }
            });

            // 새 토큰 생성
            EmailVerificationToken token = EmailVerificationToken.createToken(user, email, "EMAIL");
            tokenRepository.save(token);

            // 인증 링크 생성
            String verificationLink = emailVerificationUrl + "?token=" + token.getToken();

            // 이메일 전송
            String subject = "[책상정리] 이메일 인증을 완료해주세요";
            String htmlContent = buildEmailVerificationHtml(user.getNickname(), verificationLink);

            sendHtmlEmail(email, subject, htmlContent);

            log.info("이메일 인증 메일 발송 완료: {}", email);

        } catch (Exception e) {
            log.error("이메일 인증 메일 발송 실패: {}", email, e);
            throw new RuntimeException("이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    /**
     * 학교 이메일 인증 메일 발송
     */
    @Transactional
    public void sendSchoolEmailVerification(User user, String schoolEmail) {
        try {
            // 기존 미사용 토큰 삭제
            tokenRepository.findByUserAndTokenType(user, "SCHOOL_EMAIL").forEach(token -> {
                if (!token.getUsed()) {
                    tokenRepository.delete(token);
                }
            });

            // 새 토큰 생성
            EmailVerificationToken token = EmailVerificationToken.createToken(user, schoolEmail, "SCHOOL_EMAIL");
            tokenRepository.save(token);

            // 인증 링크 생성
            String verificationLink = schoolVerificationUrl + "?token=" + token.getToken();

            // 이메일 전송
            String subject = "[책상정리] 학교 이메일 인증을 완료해주세요";
            String htmlContent = buildSchoolEmailVerificationHtml(user.getNickname(), verificationLink);

            sendHtmlEmail(schoolEmail, subject, htmlContent);

            log.info("학교 이메일 인증 메일 발송 완료: {}", schoolEmail);

        } catch (Exception e) {
            log.error("학교 이메일 인증 메일 발송 실패: {}", schoolEmail, e);
            throw new RuntimeException("이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    /**
     * 이메일 인증 토큰 검증 및 처리
     */
    @Transactional
    public void verifyEmail(String tokenString) {
        EmailVerificationToken token = tokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 인증 링크입니다."));

        if (token.getUsed()) {
            throw new IllegalArgumentException("이미 사용된 인증 링크입니다.");
        }

        if (token.isExpired()) {
            throw new IllegalArgumentException("인증 링크가 만료되었습니다. 새로운 인증 메일을 요청해주세요.");
        }

        User user = token.getUser();

        if ("EMAIL".equals(token.getTokenType())) {
            user.setEmailVerified(true);
            user.setEmail(token.getEmail());
            log.info("이메일 인증 완료: {}", token.getEmail());
        } else if ("SCHOOL_EMAIL".equals(token.getTokenType())) {
            user.setSchoolEmailVerified(true);
            user.setSchoolEmail(token.getEmail());
            log.info("학교 이메일 인증 완료: {}", token.getEmail());
        }

        token.setUsed(true);
        tokenRepository.save(token);
        userRepository.save(user);
    }

    /**
     * HTML 이메일 전송
     */
    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    /**
     * 이메일 인증 HTML 템플릿
     */
    private String buildEmailVerificationHtml(String nickname, String verificationLink) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; margin: 20px 0; }
                        .button { display: inline-block; padding: 12px 30px; background-color: #007bff;
                                 color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>책상정리</h1>
                        </div>
                        <div class="content">
                            <h2>안녕하세요, %s님!</h2>
                            <p>책상정리 회원가입을 환영합니다.</p>
                            <p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
                            <div style="text-align: center;">
                                <a href="%s" class="button">이메일 인증하기</a>
                            </div>
                            <p style="margin-top: 20px; font-size: 14px; color: #666;">
                                버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                                <a href="%s">%s</a>
                            </p>
                            <p style="margin-top: 20px; font-size: 14px; color: #666;">
                                이 인증 링크는 24시간 동안 유효합니다.
                            </p>
                        </div>
                        <div class="footer">
                            <p>본 메일은 발신전용입니다. 문의사항은 고객센터를 이용해주세요.</p>
                            <p>&copy; 2025 책상정리. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(nickname, verificationLink, verificationLink, verificationLink);
    }

    /**
     * 학교 이메일 인증 HTML 템플릿
     */
    private String buildSchoolEmailVerificationHtml(String nickname, String verificationLink) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; margin: 20px 0; }
                        .button { display: inline-block; padding: 12px 30px; background-color: #28a745;
                                 color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>책상정리</h1>
                        </div>
                        <div class="content">
                            <h2>안녕하세요, %s님!</h2>
                            <p>신한대학교 이메일 인증을 진행합니다.</p>
                            <p>아래 버튼을 클릭하여 학교 이메일 인증을 완료해주세요.</p>
                            <div style="text-align: center;">
                                <a href="%s" class="button">학교 이메일 인증하기</a>
                            </div>
                            <p style="margin-top: 20px; font-size: 14px; color: #666;">
                                버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                                <a href="%s">%s</a>
                            </p>
                            <p style="margin-top: 20px; font-size: 14px; color: #666;">
                                이 인증 링크는 24시간 동안 유효합니다.
                            </p>
                        </div>
                        <div class="footer">
                            <p>본 메일은 발신전용입니다. 문의사항은 고객센터를 이용해주세요.</p>
                            <p>&copy; 2025 책상정리. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(nickname, verificationLink, verificationLink, verificationLink);
    }
}
