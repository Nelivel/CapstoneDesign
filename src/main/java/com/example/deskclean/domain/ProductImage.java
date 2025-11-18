package com.example.deskclean.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "imageDbid")
    private Long id;

    @Column(name = "itemDbid", nullable = false)
    private Long itemDbid;

    @Column(name = "localPath", nullable = false)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itemDbid", insertable = false, updatable = false)
    private Product product;
}
