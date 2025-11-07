<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>WebSocket Chat</title>
<style>
    body { font-family: sans-serif; }
    h1 { font-size: 24px; }
    #chat-box { border: 1px solid #ccc; width: 500px; height: 400px; overflow-y: scroll; padding: 10px; display: flex; flex-direction: column; }
    .message-container { display: flex; margin: 5px 0; }
    .message-bubble { padding: 8px 12px; border-radius: 18px; max-width: 70%; word-wrap: break-word; }
    .nickname { font-size: 12px; color: #555; }
    .other-message { justify-content: flex-start; }
    .other-message .message-bubble { background-color: #f1f0f0; }
    .other-message .nickname { text-align: left; margin-left: 5px; margin-bottom: 4px; }
    .my-message { justify-content: flex-end; }
    .my-message .message-bubble { background-color: #FF8C6E; color: white; }
    .my-message .nickname { text-align: right; margin-right: 5px; margin-bottom: 4px;}
    .system-message-container { justify-content: center; }
    .system-message { background-color: #f0f0f0; color: #666; font-size: 12px; padding: 4px 8px; border-radius: 8px; text-align: center; }
    .read-status { font-size: 10px; color: #999; text-align: right; margin-top: 2px; }
</style>
</head>
<body>
    <h1>WebSocket Chat</h1>
    <div id="chat-box"></div>
    <br>
    <input type="text" id="message-input" size="50" placeholder="대화 내용을 입력하세요.">
    <button onclick="sendMessage()">전송</button>

    <script>
        const myNickname = "${nickname}";
        const myUsername = "${username}"; 
        const messageInput = document.getElementById('message-input');
        const chatBox = document.getElementById('chat-box');
        const ws = new WebSocket("ws://" + location.host + "/chatserver/" + myUsername);
        let allMessages = new Map(); // messageId를 키로 하는 Map

        ws.onopen = function(event) {
            console.log("WebSocket 연결 성공!");
        };

        ws.onmessage = function(event) {
            const message = JSON.parse(event.data);
            console.log('Received message:', message); // 디버깅용 로그
            
            if (message.type === 'ENTER' || message.type === 'LEAVE') {
                createSystemMessage(message);
            } else if (message.type === 'TALK') {
                // 이미 표시된 메시지는 건너뛰기
                if (!allMessages.has(message.messageId)) {
                    allMessages.set(message.messageId, message);
                    createTalkMessage(message);
                    // 내가 보낸 메시지가 아니면 자동으로 읽음 처리
                    if (message.nickname !== myNickname) {
                        setTimeout(() => {
                            markMessageAsRead(message.messageId);
                        }, 500);
                    }
                }
            } else if (message.type === 'READ') {
                console.log('READ status update:', message); // 디버깅용 로그
                updateReadStatus(message);
            }
            chatBox.scrollTop = chatBox.scrollHeight;
        };

        ws.onclose = function(event) {
            console.log("WebSocket 연결 종료!");
        };

        ws.onerror = function(event) {
            console.error("WebSocket 에러:", event);
        };

        function createSystemMessage(msg) {
            const container = document.createElement('div');
            container.className = 'message-container system-message-container';
            const textDiv = document.createElement('div');
            textDiv.className = 'system-message';
            const content = (msg.type === 'ENTER') ? `[${msg.nickname}]님이 들어왔습니다.` : `[${msg.nickname}]님이 나갔습니다.`;
            textDiv.textContent = content;
            container.appendChild(textDiv);
            chatBox.appendChild(container);
        }
        
        function createTalkMessage(msg) {
            console.log('Creating message:', msg); // 디버깅
            const isMyMessage = (msg.nickname === myNickname);
            console.log('Is my message?', isMyMessage, 'myNickname:', myNickname, 'msg.nickname:', msg.nickname); // 디버깅
            const container = document.createElement('div');
            container.className = isMyMessage ? 'message-container my-message' : 'message-container other-message';
            container.setAttribute('data-message-id', msg.messageId);
            
            const messageWrapper = document.createElement('div');
            const nicknameSpan = document.createElement('div');
            nicknameSpan.className = 'nickname';
            nicknameSpan.textContent = msg.nickname;
            
            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';
            bubble.textContent = msg.content;
            
            // 읽음 상태 표시 (자신이 보낸 메시지에만)
            if (isMyMessage) {
                const readStatus = document.createElement('div');
                readStatus.className = 'read-status';
                readStatus.textContent = '안 읽음';
                readStatus.id = 'read-status-' + msg.messageId;
                messageWrapper.appendChild(readStatus);
            }
            
            messageWrapper.appendChild(nicknameSpan);
            messageWrapper.appendChild(bubble);
            container.appendChild(messageWrapper);
            chatBox.appendChild(container);
            
            console.log('Message added to chatBox. Total messages in allMessages:', allMessages.size); // 디버깅
        }
        
        function updateReadStatus(msg) {
            const readStatusElement = document.getElementById('read-status-' + msg.messageId);
            if (readStatusElement) {
                readStatusElement.textContent = '읽음';
                readStatusElement.style.color = '#4CAF50';
            }
        }
        
        function markMessageAsRead(messageId) {
            const readMessage = {
                type: 'READ',
                messageId: messageId
            };
            ws.send(JSON.stringify(readMessage));
        }

        function sendMessage() {
            if (messageInput.value.trim() === '') return;
            const message = { 
                type: 'TALK',
                content: messageInput.value 
            };
            ws.send(JSON.stringify(message));
            messageInput.value = '';
        }

        messageInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') { sendMessage(); }
        });
    </script>
</body>
</html>
