package com.example.deskclean.repository;

import com.example.deskclean.domain.Message;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // 특정 사용자가 읽지 않은 메시지 목록 (자신이 보낸 것 제외) - readBy 기반
    @Query("SELECT DISTINCT m FROM Message m JOIN FETCH m.readBy WHERE m.user.id != :userId AND :userId NOT IN (SELECT r.id FROM m.readBy r) ORDER BY m.createdAt DESC")
    List<Message> findUnreadMessagesForUser(@Param("userId") Long userId);
    
    // 특정 사용자가 읽지 않은 메시지 수 (자신이 보낸 것 제외) - readBy 기반
    @Query("SELECT COUNT(DISTINCT m) FROM Message m WHERE m.user.id != :userId AND :userId NOT IN (SELECT r.id FROM m.readBy r)")
    Long countUnreadMessagesForUser(@Param("userId") Long userId);
    
    // 모든 읽지 않은 메시지를 읽음으로 표시 (readBy 기반)
    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.isRead = true WHERE m.user.id != :userId AND :userId NOT IN (SELECT r.id FROM m.readBy r)")
    void markAllAsReadForUser(@Param("userId") Long userId);
    
    // 특정 메시지를 읽음으로 표시
    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.isRead = true WHERE m.id = :messageId")
    void markAsRead(@Param("messageId") Long messageId);
    
    // readBy를 포함하여 메시지 조회 (EAGER 로딩)
    @Query("SELECT DISTINCT m FROM Message m JOIN FETCH m.readBy WHERE m.id = :messageId")
    Message findByIdWithReadBy(@Param("messageId") Long messageId);
    
    // 최근 메시지 조회 (내림차순)
    List<Message> findAllByOrderByCreatedAtDesc();

    // 최근 N개 메시지 ID 조회 (created_at이 null이 아닌 것만)
    @Query("SELECT m.id FROM Message m WHERE m.createdAt IS NOT NULL ORDER BY m.createdAt DESC")
    List<Long> findRecentMessageIds();

    // 특정 ID 리스트의 메시지 조회 with readBy (EAGER 로딩) - 오래된 순서로
    @Query("SELECT DISTINCT m FROM Message m LEFT JOIN FETCH m.readBy WHERE m.id IN :ids ORDER BY m.createdAt ASC")
    List<Message> findByIdsWithReadBy(@Param("ids") List<Long> ids);

    // 특정 상품의 메시지 조회 with readBy (EAGER 로딩) - 오래된 순서로
    @Query("SELECT DISTINCT m FROM Message m LEFT JOIN FETCH m.readBy WHERE m.productId = :productId ORDER BY m.createdAt ASC")
    List<Message> findByProductIdWithReadBy(@Param("productId") Long productId);

    // 특정 상품의 메시지 수 조회
    Long countByProductId(Long productId);
}