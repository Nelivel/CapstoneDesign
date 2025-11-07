package com.example.deskclean.controller;

import com.example.deskclean.domain.Message;
import com.example.deskclean.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    
    @Autowired
    private MessageRepository messageRepository;
    
    //  전체 메시지 목록 테스트 조회
    //  GET /api/messages

    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {
        List<Message> messages = messageRepository.findAll();
        return ResponseEntity.ok(messages);
    }
}


