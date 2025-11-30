package com.example.deskclean.dto.Admin;

import com.example.deskclean.domain.Enum.Role;
import com.example.deskclean.domain.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserDetailDTO {
    private Long id;
    private String username;
    private String nickname;
    private Role role;
    private boolean isSuspended;
    private String suspensionReason;
    private long productCount;      // 등록한 상품 수
    private long reportCount;       // 신고당한 횟수

    public static UserDetailDTO fromEntity(User user, long productCount, long reportCount) {
        return UserDetailDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .role(user.getRole())
                .isSuspended(user.getIs_suspended() != null && user.getIs_suspended())
                .suspensionReason(user.getSuspension_reason())
                .productCount(productCount)
                .reportCount(reportCount)
                .build();
    }
}
