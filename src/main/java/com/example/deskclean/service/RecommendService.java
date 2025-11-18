package com.example.deskclean.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.deskclean.dto.Recommend.RecommendItemDto;
import com.example.deskclean.dto.Recommend.RecommendRequestDto;
import com.example.deskclean.dto.Recommend.RecommendResponseDto;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecommendService {

    private final String baseURL = "https://capstoneweb.site/api/recommend";
    // 실제 이미지 서버 URL로 변경하세요
    private final String imageServerURL = "http://34.94.118.159";

    private final WebClient client = WebClient.builder().baseUrl(baseURL).build();

    public RecommendResponseDto recommend(RecommendRequestDto request){
    
        try{
            Map<String, Object> bodyMap = new HashMap<>();
            bodyMap.put("user_id", request.getUserId());
            bodyMap.put("page", request.getPage());

            // 먼저 JsonNode로 받아서 파싱
            JsonNode responseJson = client.post()
                .bodyValue(bodyMap)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

            // items 배열 추출
            JsonNode itemsNode = responseJson.get("items");
            
            // items를 List<RecommendItemDto>로 변환
            List<RecommendItemDto> recommendItems = new java.util.ArrayList<>();
            
            if (itemsNode != null && itemsNode.isArray()) {
                for (JsonNode itemNode : itemsNode) {
                    String thumbnailPath = itemNode.get("thumbnail_path").asText();
                    
                    // thumbnail_path에서 파일명만 추출
                    String fileName = thumbnailPath.substring(thumbnailPath.lastIndexOf("/") + 1);
                    String thumbnailUrl = imageServerURL + "/thumbnails/" + fileName;
                    
                    RecommendItemDto item = RecommendItemDto.builder()
                        .dbid(itemNode.get("dbid").asLong())
                        .title(itemNode.get("title").asText())
                        .price(itemNode.get("price").asDouble())
                        .timeElapsed(itemNode.get("time_elapsed").asText())
                        .thumbnailUrl(thumbnailUrl)  // 변환된 URL
                        .category(itemNode.get("category").asText())
                        .build();
                    
                    recommendItems.add(item);
                }
            }

            return RecommendResponseDto.builder()
                .items(recommendItems)
                .build();
            
        } catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }
}