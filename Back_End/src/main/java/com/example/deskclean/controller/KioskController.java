package com.example.deskclean.controller;

import com.example.deskclean.domain.KioskTransaction;
import com.example.deskclean.domain.Product;
import com.example.deskclean.domain.Enum.Status;
import com.example.deskclean.repository.KioskTransactionRepository;
import com.example.deskclean.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/kiosk")
public class KioskController {

    @Autowired
    private KioskTransactionRepository kioskTransactionRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * 판매자: 일련번호 발급 (물품 보관 시작)
     */
    @PostMapping("/seller/start/{productId}")
    public ResponseEntity<?> sellerStart(@PathVariable Long productId) {
        try {
            // 상품 확인
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

            // 이미 진행 중인 거래가 있는지 확인
            if (kioskTransactionRepository.existsByProductId(productId)) {
                KioskTransaction existing = kioskTransactionRepository.findByProductId(productId).get();
                if (existing.getStatus() != KioskTransaction.TransactionStatus.CANCELLED) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("serialNumber", existing.getSerialNumber());
                    response.put("status", existing.getStatus());
                    response.put("cabinetNumber", existing.getCabinetNumber());
                    response.put("message", "이미 진행 중인 거래가 있습니다.");
                    return ResponseEntity.ok(response);
                }
            }

            // 새 거래 생성
            KioskTransaction transaction = new KioskTransaction();
            transaction.setProductId(productId);
            transaction.setSellerId(product.getSeller().getId());
            transaction.setStatus(KioskTransaction.TransactionStatus.WAITING);

            // 유니크한 일련번호 생성
            String serialNumber;
            do {
                serialNumber = KioskTransaction.generateSerialNumber();
            } while (kioskTransactionRepository.existsBySerialNumber(serialNumber));

            transaction.setSerialNumber(serialNumber);
            kioskTransactionRepository.save(transaction);

            Map<String, Object> response = new HashMap<>();
            response.put("serialNumber", serialNumber);
            response.put("productId", productId);
            response.put("productName", product.getProduct_name());
            response.put("status", "WAITING");
            response.put("expiresAt", transaction.getExpiresAt());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 키오스크: 일련번호로 거래 정보 조회
     */
    @GetMapping("/transaction/{serialNumber}")
    public ResponseEntity<?> getTransaction(@PathVariable String serialNumber) {
        try {
            KioskTransaction transaction = kioskTransactionRepository.findBySerialNumber(serialNumber)
                    .orElseThrow(() -> new RuntimeException("유효하지 않은 일련번호입니다."));

            // 만료 확인
            if (LocalDateTime.now().isAfter(transaction.getExpiresAt()) &&
                    transaction.getStatus() == KioskTransaction.TransactionStatus.WAITING) {
                transaction.setStatus(KioskTransaction.TransactionStatus.CANCELLED);
                kioskTransactionRepository.save(transaction);
                throw new RuntimeException("일련번호가 만료되었습니다. (30분 초과)");
            }

            Product product = productRepository.findById(transaction.getProductId())
                    .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

            Map<String, Object> response = new HashMap<>();
            response.put("transactionId", transaction.getId());
            response.put("serialNumber", transaction.getSerialNumber());
            response.put("productId", transaction.getProductId());
            response.put("productName", product.getProduct_name());
            response.put("sellerName", product.getSeller().getNickname());
            response.put("price", product.getProduct_price());
            response.put("status", transaction.getStatus());
            response.put("cabinetNumber", transaction.getCabinetNumber());
            response.put("createdAt", transaction.getCreatedAt());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 키오스크: 물품 보관 확인 (캐비닛 번호 할당)
     */
    @PostMapping("/deposit/{serialNumber}")
    public ResponseEntity<?> confirmDeposit(@PathVariable String serialNumber) {
        try {
            KioskTransaction transaction = kioskTransactionRepository.findBySerialNumber(serialNumber)
                    .orElseThrow(() -> new RuntimeException("유효하지 않은 일련번호입니다."));

            if (transaction.getStatus() != KioskTransaction.TransactionStatus.WAITING) {
                throw new RuntimeException("물품 보관 대기 상태가 아닙니다.");
            }

            // 캐비닛 번호 할당 (1~8)
            Integer cabinetNumber = KioskTransaction.assignCabinetNumber();
            transaction.setCabinetNumber(cabinetNumber);
            transaction.setStatus(KioskTransaction.TransactionStatus.DEPOSITED);
            kioskTransactionRepository.save(transaction);

            Map<String, Object> response = new HashMap<>();
            response.put("cabinetNumber", cabinetNumber);
            response.put("status", "DEPOSITED");
            response.put("message", cabinetNumber + "번 캐비닛이 잠금 해제되었습니다. 물품을 보관해주세요.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 판매자: 물품 보관 완료 확인
     */
    @PostMapping("/seller/complete/{serialNumber}")
    public ResponseEntity<?> sellerComplete(@PathVariable String serialNumber) {
        try {
            KioskTransaction transaction = kioskTransactionRepository.findBySerialNumber(serialNumber)
                    .orElseThrow(() -> new RuntimeException("유효하지 않은 일련번호입니다."));

            if (transaction.getStatus() != KioskTransaction.TransactionStatus.DEPOSITED) {
                throw new RuntimeException("물품이 보관되지 않았습니다.");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "DEPOSITED");
            response.put("cabinetNumber", transaction.getCabinetNumber());
            response.put("message", "물품 보관이 완료되었습니다. 구매자에게 알림을 전송했습니다.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 구매자: 결제 완료 (일련번호 발급)
     */
    @PostMapping("/buyer/pay/{productId}")
    public ResponseEntity<?> buyerPay(@PathVariable Long productId, @RequestBody Map<String, Object> request) {
        try {
            Long buyerId = Long.valueOf(request.get("buyerId").toString());

            KioskTransaction transaction = kioskTransactionRepository.findByProductId(productId)
                    .orElseThrow(() -> new RuntimeException("진행 중인 거래를 찾을 수 없습니다."));

            if (transaction.getStatus() != KioskTransaction.TransactionStatus.DEPOSITED) {
                throw new RuntimeException("물품이 아직 보관되지 않았습니다.");
            }

            transaction.setBuyerId(buyerId);
            transaction.setStatus(KioskTransaction.TransactionStatus.PAID);
            kioskTransactionRepository.save(transaction);

            Map<String, Object> response = new HashMap<>();
            response.put("serialNumber", transaction.getSerialNumber());
            response.put("cabinetNumber", transaction.getCabinetNumber());
            response.put("status", "PAID");
            response.put("message", "결제가 완료되었습니다. 일련번호로 키오스크에서 물품을 수령하세요.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 키오스크: 물품 수령 (구매자)
     */
    @PostMapping("/pickup/{serialNumber}")
    public ResponseEntity<?> pickup(@PathVariable String serialNumber) {
        try {
            KioskTransaction transaction = kioskTransactionRepository.findBySerialNumber(serialNumber)
                    .orElseThrow(() -> new RuntimeException("유효하지 않은 일련번호입니다."));

            if (transaction.getStatus() != KioskTransaction.TransactionStatus.PAID) {
                throw new RuntimeException("결제가 완료되지 않았습니다.");
            }

            transaction.setStatus(KioskTransaction.TransactionStatus.COMPLETED);
            kioskTransactionRepository.save(transaction);

            // 상품 상태 변경
            Product product = productRepository.findById(transaction.getProductId())
                    .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));
            product.setStatus(Status.SOLD_OUT);
            productRepository.save(product);

            Map<String, Object> response = new HashMap<>();
            response.put("cabinetNumber", transaction.getCabinetNumber());
            response.put("status", "COMPLETED");
            response.put("message", transaction.getCabinetNumber() + "번 캐비닛이 잠금 해제되었습니다. 물품을 수령하세요.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 상품별 거래 상태 조회
     */
    @GetMapping("/status/{productId}")
    public ResponseEntity<?> getStatus(@PathVariable Long productId) {
        try {
            KioskTransaction transaction = kioskTransactionRepository.findByProductId(productId)
                    .orElse(null);

            if (transaction == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "NONE");
                response.put("message", "진행 중인 거래가 없습니다.");
                return ResponseEntity.ok(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", transaction.getStatus());
            response.put("serialNumber", transaction.getSerialNumber());
            response.put("cabinetNumber", transaction.getCabinetNumber());
            response.put("createdAt", transaction.getCreatedAt());
            response.put("expiresAt", transaction.getExpiresAt());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
