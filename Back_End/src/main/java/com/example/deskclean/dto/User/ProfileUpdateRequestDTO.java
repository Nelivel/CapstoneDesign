package com.example.deskclean.dto.User;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateRequestDTO {
    @NotBlank(message = "닉네임은 필수입니다")
    @Size(min = 2, max = 20, message = "닉네임은 2-20자여야 합니다")
    private String nickname;

    // 추후 필요한 다른 프로필 정보 추가 가능 (이메일, 전화번호 등)
}
