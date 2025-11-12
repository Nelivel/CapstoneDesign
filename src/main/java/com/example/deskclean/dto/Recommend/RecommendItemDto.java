package com.example.deskclean.dto.Recommend;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties
public class RecommendItemDto {
    private Long dbid;

    private String title;

    private Double price;

    @JsonProperty("time_elapsed")
    private String timeElapsed;

    @JsonProperty("thumbnail_url")
    private String thumbnailUrl;

    private String category;
}
