package com.example.deskclean.controller;

// 필요한 import 구문들
import com.example.deskclean.domain.User;
import com.example.deskclean.repository.MessageRepository;
import com.example.deskclean.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import java.security.Principal;

@Controller
public class ChatController {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    @Autowired
    public ChatController(UserRepository userRepository, MessageRepository messageRepository) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }

    @GetMapping("/")
    public String index() {
        return "redirect:/login"; // 로그인 페이지로 이동
    }

    @GetMapping("/chat")
    public String chat(Model model, Principal principal) {
        if (principal == null) {
            // 혹시 모르니 로그인 안 된 사용자는 로그인 페이지로
            return "redirect:/login";
        }
        
        // 로그인한 ID(username)를 가져오기 (예: "user1")
        String username = principal.getName();
        
        // ID로 DB에서 User 정보를 찾기
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다: " + username));
        
        // 채팅방 접속 전 읽지 않은 메시지 수 조회 (배지 표시용)
        Long unreadCount = messageRepository.countUnreadMessagesForUser(user.getId());
        model.addAttribute("unreadCount", unreadCount);
        
        // JSP 페이지로 'username'과 'nickname'을 전달
        model.addAttribute("username", user.getUsername());
        model.addAttribute("nickname", user.getNickname());
        
        return "chat"; // /webapp/WEB-INF/views/chat.jsp 파일을 보여줌
    }
}