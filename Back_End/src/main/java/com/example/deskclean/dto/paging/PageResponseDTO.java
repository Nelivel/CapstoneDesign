package com.example.deskclean.dto.paging;

import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
public class PageResponseDTO {
    private long totalElement;
    private int totalPages;
    private int currentElements;
    private List<?> content;

    public PageResponseDTO(Page page){
        this.content = page.getContent();
        this.totalPages = page.getTotalPages();
        this.currentElements = page.getNumberOfElements() ;
        this.totalElement = page.getTotalElements();
    }
}
