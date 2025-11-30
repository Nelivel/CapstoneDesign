package com.example.deskclean.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KakaoApproveResponse {

    private String aid;  // 요청 고유번호
    private String tid;  // 결제 고유번호
    private String cid;  // 가맹점 코드
    private String partner_order_id;
    private String partner_user_id;
    private String payment_method_type;

    private Amount amount;
    private String item_name;
    private String item_code;
    private int quantity;
    private String created_at;
    private String approved_at;

    @Getter
    @Setter
    public static class Amount {
        private int total;
        private int tax_free;
        private int vat;
        private int point;
        private int discount;
    }
}
