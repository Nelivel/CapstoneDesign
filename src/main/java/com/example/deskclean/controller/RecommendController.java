package com.example.deskclean.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.deskclean.dto.Recommend.RecommendRequestDto;
import com.example.deskclean.dto.Recommend.RecommendResponseDto;
import com.example.deskclean.service.RecommendService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/recommend")
public class RecommendController {

    private final RecommendService recommendService;

    @PostMapping
    public ResponseEntity<RecommendResponseDto> recommend(@Valid @RequestBody RecommendRequestDto request) {
        //TODO: process POST request
        RecommendResponseDto response = recommendService.recommend(request);

        if (response == null || response.getItems() == null) {
            return ResponseEntity.internalServerError().build();
        }
        
        return ResponseEntity.ok(response);
    }
}
