// src/pages/ChatListPage.jsx
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { MOCK_CHAT_ROOMS } from '../mock-chats';
import './ChatListPage.css';

function ChatListPage() {
  const { navigate } = useNavigation();

  return (
    <div className="chat-list-page">
      {/* 뒤로가기 버튼이 없는 헤더 */}
      <header className="chat-list-header">
        채팅
      </header>
      <main className="chat-room-list">
        {MOCK_CHAT_ROOMS.map(room => (
          <button key={room.id} className="chat-room-item" onClick={() => navigate(`/chat/${room.id}`)}>
            <img src={room.partner.avatarUrl} alt={room.partner.nickname} className="chat-partner-avatar" />
            <div className="chat-info">
              <div className="chat-partner-nickname">{room.partner.nickname}</div>
              <div className="chat-last-message">{room.lastMessage}</div>
            </div>
            <div className="chat-meta">
              <div className="chat-timestamp">{room.timestamp}</div>
              {room.unreadCount > 0 && (
                <div className="unread-badge">{room.unreadCount}</div>
              )}
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}

export default ChatListPage;