package com.example.deskclean.domain.Enum;

public enum ReviewItem {
    // 긍정적 항목
    PUNCTUAL("시간 약속을 잘 지켜요"),
    GOOD_CONDITION("물품상태가 설명한 것과 같아요"),
    KIND("친절하고 매너가 좋아요"),
    RESPONSIVE("응답이 빠르고 의사소통이 원활해요"),
    FAIR_PRICE("좋은 물품을 저렴하게 판매해요"),

    // 부정적 항목
    NOT_PUNCTUAL("시간 약속을 잘 지키지 않아요"),
    BAD_CONDITION("물품상태가 설명과 달라요"),
    UNKIND("불친절하고 매너가 없어요"),
    UNRESPONSIVE("응답이 느리고 의사소통이 어려워요"),
    EXCESSIVE_BARGAIN("가격 흥정이 과도해요");

    private final String description;

    ReviewItem(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public boolean isPositive() {
        return this == PUNCTUAL || this == GOOD_CONDITION || this == KIND ||
               this == RESPONSIVE || this == FAIR_PRICE;
    }

    public boolean isNegative() {
        return !isPositive();
    }
}
