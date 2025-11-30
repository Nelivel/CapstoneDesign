package com.example.deskclean.dto.User;

import com.example.deskclean.domain.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProfileUpdateResponseDTO {
    private Long id;
    private String username;
    private String nickname;

    public static ProfileUpdateResponseDTO fromEntity(User user) {
        return ProfileUpdateResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .build();
    }
}
