package com.example.deskclean.controller;

import com.example.deskclean.domain.Ejection;
import com.example.deskclean.dto.EjectionRequestDTO;
import com.example.deskclean.service.EjectionService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Log4j2
@RestController
@RequestMapping("/api/ejection")
public class EjectionController {

    @Autowired
    private EjectionService ejectionService;

    // 유저 추방 API
    @PostMapping("/eject")
    public Ejection ejectUser(@RequestBody EjectionRequestDTO ejectionRequestDTO,
                              @RequestHeader(value = "Authorization", required = false) String token) {

        // TODO: JWT 토큰에서 admin_id 추출 로직 구현 필요
        // Authentication을 사용하거나 JWT 토큰에서 추출
        Long adminUid = 1L; // 임시 하드코딩

        return ejectionService.ejectUser(
                ejectionRequestDTO.getEjectionUid(),
                adminUid,
                ejectionRequestDTO.getReason()
        );
    }
}
