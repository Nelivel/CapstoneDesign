package com.example.deskclean.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.deskclean.dto.Recommend.RecommendItemDto;
import com.example.deskclean.dto.Recommend.RecommendRequestDto;
import com.example.deskclean.dto.Recommend.RecommendResponseDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecommendService {

    private final String baseURL = "https://capstoneweb.site/recommendation/recommend";

    private final WebClient client = WebClient.builder().baseUrl(baseURL).build();

    public RecommendResponseDto recommend(RecommendRequestDto request){
    
        try{
            Map<String, Object> bodyMap = new HashMap<>();
            bodyMap.put("user_id", request.getUserId());
            bodyMap.put("page", request.getPage());

            List<RecommendItemDto> recommendItems = client.post()
                .bodyValue(bodyMap)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<RecommendItemDto>>(){})
                .block();

                return RecommendResponseDto.builder()
                .items(recommendItems)
                .build();
            
        } catch (Exception e){
            
            e.printStackTrace();

            return null;
        }
        
    }
}
