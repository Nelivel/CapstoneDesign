package com.example.deskclean.dto.User;

import com.example.deskclean.domain.Enum.Role;
import com.example.deskclean.domain.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SignupResponseDTO {
    private Long id;
    private String username;
    private String nickname;
    private Role role;

    public static SignupResponseDTO fromEntity(User user) {
        return SignupResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .role(user.getRole())
                .build();
    }
}
