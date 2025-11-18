package com.example.deskclean.repository;

import com.example.deskclean.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // 최근 메시지 ID 조회 (100개, 오래된 순서로)
    @Query(value = "SELECT id FROM message ORDER BY created_at ASC LIMIT 100",
           nativeQuery = true)
    List<Long> findRecentMessageIds();

    // user와 함께 메시지 조회
    @Query("SELECT m FROM Message m " +
           "JOIN FETCH m.user " +
           "WHERE m.id IN :ids " +
           "ORDER BY m.createdAt ASC")
    List<Message> findByIdsWithUser(@Param("ids") List<Long> ids);

    // 전체 조회용
    @Query("SELECT m FROM Message m " +
           "JOIN FETCH m.user " +
           "ORDER BY m.createdAt DESC")
    List<Message> findAllWithUser();

    // 읽지 않은 메시지 개수 조회 (is_read 필드 사용)
    @Query(value =
        "SELECT COUNT(*) FROM message " +
        "WHERE user_id != :userId " +  // 내가 보낸 메시지 제외
        "AND is_read = false", // 읽지 않은 메시지만
        nativeQuery = true)
    Long countUnreadMessagesForUser(@Param("userId") Long userId);
}
