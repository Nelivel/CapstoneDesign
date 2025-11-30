package com.example.deskclean.dto.Admin;

import com.example.deskclean.domain.Enum.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserRoleChangeRequestDTO {
    @NotNull(message = "역할은 필수입니다.")
    private Role role;
}
