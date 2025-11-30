package com.example.deskclean.controller;

import com.example.deskclean.domain.Product;
import com.example.deskclean.domain.RemoteTrade;
import com.example.deskclean.domain.User;
import com.example.deskclean.domain.Enum.Location;
import com.example.deskclean.domain.Enum.Status;
import com.example.deskclean.dto.RemoteTradeDTO;
import com.example.deskclean.repository.ProductRepository;
import com.example.deskclean.repository.RemoteTradeRepository;
import com.example.deskclean.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 비대면 거래 API 컨트롤러
 */
@RestController
@RequestMapping("/api/remote-trade")
public class RemoteTradeController {

    private static final Logger logger = LoggerFactory.getLogger(RemoteTradeController.class);

    @Autowired
    private RemoteTradeRepository remoteTradeRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 비대면 거래 세션 조회 또는 생성
     * GET /api/remote-trade/{productId}
     */
    @GetMapping("/{productId}")
    public ResponseEntity<?> getOrCreateRemoteTradeSession(@PathVariable Long productId) {
        try {
            logger.info("Get or create remote trade session for product: {}", productId);

            // 상품 조회
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

            // 비대면 거래인지 확인
            if (product.getLocation() == null ||
                (!product.getLocation().equals(Location.NONE_PERSON))) {
                return ResponseEntity.badRequest().body(Map.of("error", "비대면 거래 상품이 아닙니다."));
            }

            // 기존 세션 조회 또는 새로 생성
            RemoteTrade remoteTrade = remoteTradeRepository.findByProductId(productId)
                    .orElseGet(() -> {
                        RemoteTrade newSession = new RemoteTrade();
                        newSession.setProductId(productId);
                        newSession.setSellerId(product.getSeller().getId());
                        newSession.setFinalPrice(product.getProduct_price().intValue());
                        newSession.setStatus(RemoteTrade.TradeStatus.PENDING);
                        return remoteTradeRepository.save(newSession);
                    });

            RemoteTradeDTO dto = new RemoteTradeDTO(remoteTrade);
            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            logger.error("Error getting or creating remote trade session", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 판매자: 거래 시작 (발송 준비 완료)
     * POST /api/remote-trade/{productId}/seller/start
     */
    @PostMapping("/{productId}/seller/start")
    public ResponseEntity<?> sellerStartTrade(@PathVariable Long productId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "인증이 필요합니다."));
            }

            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            RemoteTrade remoteTrade = remoteTradeRepository.findByProductId(productId)
                    .orElseThrow(() -> new RuntimeException("거래 세션을 찾을 수 없습니다."));

            // 판매자 확인
            if (!remoteTrade.getSellerId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "판매자만 실행할 수 있습니다."));
            }

            // 상태 업데이트
            remoteTrade.setStatus(RemoteTrade.TradeStatus.SELLER_READY);
            remoteTrade.setSellerStartedAt(LocalDateTime.now());
            remoteTradeRepository.save(remoteTrade);

            logger.info("Seller started trade for product: {}", productId);
            return ResponseEntity.ok(new RemoteTradeDTO(remoteTrade));

        } catch (Exception e) {
            logger.error("Error in seller start trade", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 판매자: 발송 완료
     * POST /api/remote-trade/{productId}/seller/complete
     */
    @PostMapping("/{productId}/seller/complete")
    public ResponseEntity<?> sellerCompleteTrade(@PathVariable Long productId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "인증이 필요합니다."));
            }

            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            RemoteTrade remoteTrade = remoteTradeRepository.findByProductId(productId)
                    .orElseThrow(() -> new RuntimeException("거래 세션을 찾을 수 없습니다."));

            // 판매자 확인
            if (!remoteTrade.getSellerId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "판매자만 실행할 수 있습니다."));
            }

            // 구매자가 결제했는지 확인
            if (remoteTrade.getStatus() != RemoteTrade.TradeStatus.BUYER_PAID) {
                return ResponseEntity.badRequest().body(Map.of("error", "구매자가 아직 결제하지 않았습니다."));
            }

            // 상태 업데이트
            remoteTrade.setStatus(RemoteTrade.TradeStatus.SELLER_COMPLETED);
            remoteTrade.setSellerCompletedAt(LocalDateTime.now());
            remoteTradeRepository.save(remoteTrade);

            logger.info("Seller completed trade for product: {}", productId);
            return ResponseEntity.ok(new RemoteTradeDTO(remoteTrade));

        } catch (Exception e) {
            logger.error("Error in seller complete trade", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 구매자: 결제
     * POST /api/remote-trade/{productId}/buyer/pay
     */
    @PostMapping("/{productId}/buyer/pay")
    public ResponseEntity<?> buyerPayTrade(@PathVariable Long productId, @RequestBody Map<String, Object> payload) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "인증이 필요합니다."));
            }

            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            RemoteTrade remoteTrade = remoteTradeRepository.findByProductId(productId)
                    .orElseThrow(() -> new RuntimeException("거래 세션을 찾을 수 없습니다."));

            // 구매자 설정 (처음 결제 시)
            if (remoteTrade.getBuyerId() == null) {
                remoteTrade.setBuyerId(user.getId());
            } else if (!remoteTrade.getBuyerId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "다른 구매자가 이미 거래를 진행 중입니다."));
            }

            // 판매자가 준비되었는지 확인
            if (remoteTrade.getStatus() != RemoteTrade.TradeStatus.SELLER_READY) {
                return ResponseEntity.badRequest().body(Map.of("error", "판매자가 아직 준비되지 않았습니다."));
            }

            // 결제 금액
            Integer amount = payload.get("amount") != null ? (Integer) payload.get("amount") : remoteTrade.getFinalPrice();

            // 상태 업데이트
            remoteTrade.setStatus(RemoteTrade.TradeStatus.BUYER_PAID);
            remoteTrade.setPaidAmount(amount);
            remoteTrade.setBuyerPaidAt(LocalDateTime.now());
            remoteTradeRepository.save(remoteTrade);

            logger.info("Buyer paid for product: {}, amount: {}", productId, amount);
            return ResponseEntity.ok(new RemoteTradeDTO(remoteTrade));

        } catch (Exception e) {
            logger.error("Error in buyer pay trade", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 구매자: 거래 완료 확인
     * POST /api/remote-trade/{productId}/buyer/complete
     */
    @PostMapping("/{productId}/buyer/complete")
    public ResponseEntity<?> buyerCompleteTrade(@PathVariable Long productId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "인증이 필요합니다."));
            }

            String username = auth.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            RemoteTrade remoteTrade = remoteTradeRepository.findByProductId(productId)
                    .orElseThrow(() -> new RuntimeException("거래 세션을 찾을 수 없습니다."));

            // 구매자 확인
            if (!remoteTrade.getBuyerId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "구매자만 실행할 수 있습니다."));
            }

            // 판매자가 발송 완료했는지 확인
            if (remoteTrade.getStatus() != RemoteTrade.TradeStatus.SELLER_COMPLETED) {
                return ResponseEntity.badRequest().body(Map.of("error", "판매자가 아직 발송을 완료하지 않았습니다."));
            }

            // 상태 업데이트
            remoteTrade.setStatus(RemoteTrade.TradeStatus.COMPLETED);
            remoteTrade.setBuyerCompletedAt(LocalDateTime.now());
            remoteTradeRepository.save(remoteTrade);

            // 상품 상태를 SOLD_OUT으로 변경
            Product product = productRepository.findById(productId).orElse(null);
            if (product != null) {
                product.setStatus(Status.SOLD_OUT);
                product.set_completed(true);
                productRepository.save(product);
            }

            logger.info("Buyer completed trade for product: {}", productId);
            return ResponseEntity.ok(new RemoteTradeDTO(remoteTrade));

        } catch (Exception e) {
            logger.error("Error in buyer complete trade", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
