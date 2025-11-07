// src/pages/ChatListPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getProducts } from '../api/productApi'; // 상품 목록 API
import { getMe } from '../api/authApi';
import { getAllMessages, getMessagesByProduct } from '../api/messageApi'; // 메시지 API
import './ChatListPage.css';

function ChatListPage() {
  const { navigate } = useNavigation();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const wsRef = useRef(null);

  // 현재 사용자 정보 로드
  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setCurrentUser(me);
      } catch (e) {
        console.error('사용자 정보 로드 실패:', e);
      }
    })();
  }, []);

  // 채팅방 목록 로드
  useEffect(() => {
    if (!currentUser) return; // 사용자 정보가 없으면 로드하지 않음
    
    (async () => {
      try {
        setLoading(true);
        
        // 현재 사용자 정보
        if (!currentUser) {
          console.warn('ChatListPage: Current user not found');
          setChatRooms([]);
          return;
        }
        
        // 모든 상품 목록 가져오기
        const products = await getProducts();
        if (!products || !Array.isArray(products) || products.length === 0) {
          console.warn('ChatListPage: No products found');
          setChatRooms([]);
          return;
        }
        
        // 현재 사용자가 참여한 채팅방만 필터링
        // 1. 내가 판매자인 상품
        // 2. 내가 메시지를 보낸 상품
        const sellerProducts = products.filter(p => {
          const sellerId = p.seller?.id || p.sellerId;
          return sellerId === currentUser.id;
        });
        
        // 내가 메시지를 보낸 상품 ID 목록 가져오기
        let myMessageProductIds = new Set();
        try {
          const allMessages = await getAllMessages();
          allMessages.forEach(msg => {
            if (msg.user?.id === currentUser.id && msg.product?.id) {
              myMessageProductIds.add(msg.product.id);
            }
          });
        } catch (e) {
          console.warn('ChatListPage: Failed to load messages for filtering:', e);
        }
        
        // 판매자 상품 + 내가 메시지를 보낸 상품 합치기
        const myProducts = products.filter(p => {
          const sellerId = p.seller?.id || p.sellerId;
          const productId = p.id;
          return sellerId === currentUser.id || myMessageProductIds.has(productId);
        });
        
        // 각 상품별로 메시지 확인
        const rooms = await Promise.all(myProducts.map(async (product) => {
          // null 반환 시 필터링되도록 null 체크 추가
          const sellerNickname = product.seller?.nickname || product.seller?.username || 'Unknown';
          const sellerId = product.seller?.id || product.sellerId;
          
          // 해당 상품의 메시지 가져오기
          let relatedMessages = [];
          try {
            relatedMessages = await getMessagesByProduct(product.id);
            // 내가 보낸 메시지가 있거나, 상대방이 보낸 메시지가 있는 경우만 표시
            const hasMyMessage = relatedMessages.some(m => m.user?.id === currentUser.id);
            const hasOtherMessage = relatedMessages.some(m => m.user?.id !== currentUser.id && m.user?.id !== sellerId);
            if (!hasMyMessage && !hasOtherMessage && relatedMessages.length === 0) {
              return null; // 메시지가 없으면 채팅방 표시 안 함
            }
          } catch (e) {
            console.warn(`ChatListPage: Failed to load messages for product ${product.id}:`, e);
            return null; // 메시지 로드 실패 시 채팅방 제외
          }
          
          // 최신 메시지 찾기
          const sortedMessages = relatedMessages.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA; // 최신순
          });
          
          const lastMessage = sortedMessages[0];
          // 상대방이 보낸 메시지 중 읽지 않은 것만 카운트
          // 자신이 보낸 메시지는 절대 안읽음으로 카운트하지 않음
          const unreadCount = relatedMessages.filter(m => {
            // 자신이 보낸 메시지는 제외
            const messageUserId = m.user?.id;
            const currentUserId = currentUser.id;
            
            // ID 비교 (숫자로 변환하여 비교)
            const msgUserIdNum = messageUserId ? Number(messageUserId) : null;
            const currentUserIdNum = currentUserId ? Number(currentUserId) : null;
            
            // 자신이 보낸 메시지면 제외
            if (msgUserIdNum !== null && currentUserIdNum !== null && msgUserIdNum === currentUserIdNum) {
              return false;
            }
            
            // 상대방이 보낸 메시지 중, 읽지 않은 것만 카운트
            // readBy 배열에 현재 사용자가 없으면 읽지 않은 것으로 간주
            const isReadByMe = m.readBy && Array.isArray(m.readBy) && 
              m.readBy.some(r => {
                const rId = r?.id ? Number(r.id) : null;
                return rId !== null && currentUserIdNum !== null && rId === currentUserIdNum;
              });
            
            // 읽지 않은 메시지만 카운트
            return !isReadByMe;
          }).length;
          
          // 상품 ID가 숫자인지 확인
          const productIdNum = Number(product.id);
          if (isNaN(productIdNum)) {
            console.warn('ChatListPage: Invalid product ID:', product.id);
            return null; // 유효하지 않은 상품 ID는 제외
          }
          
          // 상대방 정보 결정 (판매자가 아닌 상대방 찾기)
          let partnerNickname = sellerNickname;
          let partnerId = sellerId;
          if (lastMessage) {
            // 마지막 메시지를 보낸 사람이 상대방
            if (lastMessage.user?.id !== currentUser.id) {
              partnerNickname = lastMessage.nickname || sellerNickname;
              partnerId = lastMessage.user?.id || sellerId;
            }
          }
          
          return {
            id: productIdNum, // 채팅방 ID는 상품 ID로 사용 (숫자로 변환)
            productId: productIdNum, // productId도 숫자로 변환
            partner: {
              nickname: partnerNickname,
              avatarUrl: '' // 기본 아바타 없음 (CSS로 처리)
            },
            lastMessage: lastMessage?.content || `${product.productName || '상품'}에 대한 채팅을 시작하세요.`,
            timestamp: lastMessage?.createdAt 
              ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date(product.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unreadCount: unreadCount,
            productTitle: product.productName || '제목 없음',
          };
        }));
        
        // null 값 제거
        const validRooms = rooms.filter(room => room !== null);
        
        // 최근 메시지 순으로 정렬
        validRooms.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime() || 0;
          const timeB = new Date(b.timestamp).getTime() || 0;
          return timeB - timeA; // 최신순
        });
        
        console.log('ChatListPage: Created chat rooms:', validRooms);
        setChatRooms(validRooms);
        
        // 채팅방 목록 로드 후 WebSocket이 연결되어 있으면 unreadCount 새로고침
        // (채팅방에서 돌아온 후 최신 읽음 상태 반영)
        // 주의: refreshUnreadCounts는 useCallback이므로 이 시점에서는 아직 정의되지 않음
        // 대신 chatRooms.length가 변경되면 위의 useEffect가 자동으로 실행됨
      } catch (error) {
        console.error('채팅방 목록 로드 실패:', error);
        setChatRooms([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);
  
  // WebSocket 연결 후 읽지 않은 메시지 상태 확인 (먼저 정의)
  const refreshUnreadCounts = useCallback(async () => {
    if (!currentUser || chatRooms.length === 0) return;
    
    try {
      console.log('ChatListPage: Refreshing unread counts for all chat rooms');
      // 모든 채팅방의 unreadCount를 다시 계산
      const updatedRooms = await Promise.all(chatRooms.map(async (room) => {
        try {
          const messages = await getMessagesByProduct(room.productId);
          const currentUserIdNum = currentUser?.id ? Number(currentUser.id) : null;
          
          const accurateUnreadCount = messages.filter(m => {
            const msgUserId = m.user?.id ? Number(m.user.id) : null;
            
            if (msgUserId !== null && currentUserIdNum !== null && msgUserId === currentUserIdNum) {
              return false;
            }
            
            const isReadByMe = m.readBy && Array.isArray(m.readBy) && 
              m.readBy.some(r => {
                const rId = r?.id ? Number(r.id) : null;
                return rId !== null && currentUserIdNum !== null && rId === currentUserIdNum;
              });
            
            return !isReadByMe;
          }).length;
          
          if (room.unreadCount !== accurateUnreadCount) {
            console.log('ChatListPage: Updating unreadCount for product', room.productId, 'from', room.unreadCount, 'to', accurateUnreadCount);
          }
          
          return { ...room, unreadCount: accurateUnreadCount };
        } catch (error) {
          console.error('ChatListPage: Failed to refresh unreadCount for room:', room.productId, error);
          return room;
        }
      }));
      
      setChatRooms(updatedRooms);
      console.log('ChatListPage: ✅ Refreshed unread counts for all chat rooms');
    } catch (error) {
      console.error('ChatListPage: ❌ Failed to refresh unread counts:', error);
    }
  }, [currentUser, chatRooms]);
  
  // chatRooms가 업데이트되고 WebSocket이 연결되어 있으면 unreadCount 새로고침
  useEffect(() => {
    if (chatRooms.length === 0 || !currentUser) {
      console.log('ChatListPage: Skipping unreadCount refresh - chatRooms.length:', chatRooms.length, 'currentUser:', !!currentUser);
      return;
    }
    
    console.log('ChatListPage: chatRooms updated, checking WebSocket connection...');
    
    // WebSocket 연결을 기다리며 unreadCount 새로고침
    let timeoutId = null;
    let retryCount = 0;
    const maxRetries = 20; // 최대 10초 대기 (500ms * 20)
    
    const checkAndRefresh = () => {
      retryCount++;
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log('ChatListPage: ✅ WebSocket is open, will refresh unread counts in 2 seconds');
        // 채팅방 목록이 업데이트된 후 약간의 지연을 두고 unreadCount 새로고침
        // (채팅방에서 돌아온 후 최신 읽음 상태 반영)
        timeoutId = setTimeout(() => {
          console.log('ChatListPage: Chat rooms updated, refreshing unread counts');
          refreshUnreadCounts();
        }, 2000); // 2초로 증가 (백엔드 처리 시간 고려)
      } else {
        if (retryCount < maxRetries) {
          // WebSocket이 아직 연결되지 않았으면 500ms 후 다시 시도
          console.log(`ChatListPage: WebSocket not ready (state: ${wsRef.current?.readyState}), retrying... (${retryCount}/${maxRetries})`);
          timeoutId = setTimeout(checkAndRefresh, 500);
        } else {
          console.warn('ChatListPage: ⚠️ WebSocket connection timeout, refreshing unread counts anyway');
          // 타임아웃이 발생해도 일단 새로고침 시도
          refreshUnreadCounts();
        }
      }
    };
    
    checkAndRefresh();
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        console.log('ChatListPage: Cleaned up unreadCount refresh timeout');
      }
    };
  }, [chatRooms.length, currentUser?.id, refreshUnreadCounts]); // chatRooms.length 변경 시 실행

  // WebSocket 연결하여 실시간 읽음 상태 업데이트
  useEffect(() => {
    if (!currentUser || !currentUser.username) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    // 기존 연결이 있으면 먼저 정리
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = `ws://localhost:9090/chatserver/${currentUser.username}`;
    console.log('ChatListPage: Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('ChatListPage: ✅ WebSocket connected successfully');
      
      // WebSocket 연결 후 약간의 지연을 두고 unreadCount 새로고침
      // (채팅방에서 돌아온 후 최신 읽음 상태 반영)
      setTimeout(() => {
        if (chatRooms.length > 0 && currentUser) {
          console.log('ChatListPage: WebSocket connected, will refresh unread counts in 2 seconds');
        }
      }, 500);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('ChatListPage: WebSocket message received:', data, 'type:', data.type);
        
        if (data.type === 'READ') {
          console.log('ChatListPage: 🔵 READ message detected!', data);
          // 읽음 처리 메시지 수신 시 채팅방 목록의 unreadCount 업데이트
          const readMessageId = data.messageId ? Number(data.messageId) : null;
          const readProductId = data.productId ? Number(data.productId) : null;
          const readByUserId = data.readByUserId ? Number(data.readByUserId) : null; // 백엔드에서 전송한 읽은 사용자 ID
          
          if (readMessageId && readProductId) {
            console.log('ChatListPage: ✅ Received READ message for messageId:', readMessageId, 'productId:', readProductId, 'readByUserId:', readByUserId);
            
            const currentUserIdNum = currentUser?.id ? Number(currentUser.id) : null;
            
            // 현재 사용자가 읽은 메시지인 경우에만 unreadCount 감소
            if (readByUserId && currentUserIdNum && readByUserId === currentUserIdNum) {
              console.log('ChatListPage: Current user read a message, updating unreadCount immediately');
              // 즉시 unreadCount 감소 (낙관적 업데이트)
              setChatRooms(prev => {
                const updated = prev.map(room => {
                  // productId를 숫자로 변환하여 비교
                  const roomProductId = room.productId ? Number(room.productId) : null;
                  const targetProductId = readProductId ? Number(readProductId) : null;
                  
                  if (roomProductId !== null && targetProductId !== null && roomProductId === targetProductId && room.unreadCount > 0) {
                    const newUnreadCount = Math.max(0, room.unreadCount - 1);
                    console.log('ChatListPage: ✅ Immediately decreased unreadCount for product:', readProductId, 'from', room.unreadCount, 'to', newUnreadCount);
                    return { ...room, unreadCount: newUnreadCount };
                  }
                  return room;
                });
                console.log('ChatListPage: Updated chat rooms after READ:', updated.map(r => ({ productId: r.productId, unreadCount: r.unreadCount })));
                return updated;
              });
            }
            
            // 백엔드에서 최신 상태를 가져와서 정확한 unreadCount 계산 (약간의 지연 후)
            setTimeout(async () => {
              try {
                console.log('ChatListPage: Reloading messages for product:', readProductId, 'to verify unreadCount');
                const messages = await getMessagesByProduct(readProductId);
                console.log('ChatListPage: Reloaded', messages.length, 'messages');
                
                // 정확한 unreadCount 계산
                const accurateUnreadCount = messages.filter(m => {
                  const msgUserId = m.user?.id ? Number(m.user.id) : null;
                  
                  // 자신이 보낸 메시지는 제외
                  if (msgUserId !== null && currentUserIdNum !== null && msgUserId === currentUserIdNum) {
                    return false;
                  }
                  
                  // readBy 배열에 현재 사용자가 없으면 읽지 않은 것으로 간주
                  const isReadByMe = m.readBy && Array.isArray(m.readBy) && 
                    m.readBy.some(r => {
                      const rId = r?.id ? Number(r.id) : null;
                      return rId !== null && currentUserIdNum !== null && rId === currentUserIdNum;
                    });
                  
                  return !isReadByMe;
                }).length;
                
                console.log('ChatListPage: Calculated accurate unreadCount:', accurateUnreadCount, 'for product:', readProductId);
                
                // 채팅방 목록 업데이트 (정확한 값으로)
                setChatRooms(prev => {
                  const updated = prev.map(room => {
                    // productId를 숫자로 변환하여 비교
                    const roomProductId = room.productId ? Number(room.productId) : null;
                    const targetProductId = readProductId ? Number(readProductId) : null;
                    
                    if (roomProductId !== null && targetProductId !== null && roomProductId === targetProductId) {
                      if (room.unreadCount !== accurateUnreadCount) {
                        console.log('ChatListPage: ✅ Updated unreadCount (verified) for product:', readProductId, 'from', room.unreadCount, 'to', accurateUnreadCount);
                      }
                      return { ...room, unreadCount: accurateUnreadCount };
                    }
                    return room;
                  });
                  console.log('ChatListPage: Updated chat rooms after verification:', updated.map(r => ({ productId: r.productId, unreadCount: r.unreadCount })));
                  return updated;
                });
              } catch (error) {
                console.error('ChatListPage: ❌ Failed to reload messages for unreadCount verification:', error);
              }
            }, 500); // 500ms 후 검증 (백엔드 처리 시간 고려)
          } else {
            console.warn('ChatListPage: ⚠️ READ message received without productId or messageId. messageId:', readMessageId, 'productId:', readProductId);
          }
        } else if (data.type === 'TALK') {
          // 새 메시지 수신 시 채팅방 목록 업데이트
          const msgProductId = data.productId ? Number(data.productId) : null;
          if (msgProductId) {
            console.log('ChatListPage: New message received for product:', msgProductId);
            // 채팅방 목록에서 해당 상품의 마지막 메시지와 시간 업데이트
            setChatRooms(prev => prev.map(room => {
              if (room.productId === msgProductId) {
                return {
                  ...room,
                  lastMessage: data.content || room.lastMessage,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  // 자신이 보낸 메시지가 아니면 unreadCount 증가
                  unreadCount: data.nickname !== currentUser?.nickname 
                    ? (room.unreadCount || 0) + 1 
                    : room.unreadCount
                };
              }
              return room;
            }));
            
            // 최신순으로 다시 정렬
            setChatRooms(prev => {
              const sorted = [...prev].sort((a, b) => {
                const timeA = new Date(a.timestamp).getTime() || 0;
                const timeB = new Date(b.timestamp).getTime() || 0;
                return timeB - timeA;
              });
              return sorted;
            });
          }
        }
      } catch (e) {
        console.error('ChatListPage: WebSocket message parse error:', e);
      }
    };
    
    ws.onerror = (error) => {
      console.error('ChatListPage: WebSocket error:', error);
    };
    
    ws.onclose = (event) => {
      console.log('ChatListPage: WebSocket disconnected:', event.code, event.reason);
    };
    
    wsRef.current = ws;
    
    return () => {
      console.log('ChatListPage: Cleaning up WebSocket connection');
      if (wsRef.current === ws) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
    };
  }, [currentUser?.username]);

  // 채팅방 목록이 다시 포커스될 때 읽음 상태 업데이트
  useEffect(() => {
    const handleVisibilityChange = () => {
      // 페이지가 다시 보일 때 채팅방 목록 업데이트
      if (!document.hidden && currentUser) {
        console.log('ChatListPage: Page visible, refreshing chat list');
        // 채팅방 목록 다시 로드
        refreshUnreadCounts();
      }
    };
    
    // 페이지 포커스 이벤트도 감지
    const handleFocus = () => {
      if (currentUser && chatRooms.length > 0) {
        console.log('ChatListPage: Page focused, refreshing unread counts');
        refreshUnreadCounts();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentUser, chatRooms.length, refreshUnreadCounts]);
  
  return (
    <div className="chat-list-page">
      {/* 뒤로가기 버튼이 없는 헤더 */}
      <header className="chat-list-header">
        채팅
      </header>
      <main className="chat-room-list">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>채팅방 목록을 불러오는 중...</div>
        ) : chatRooms.length > 0 ? (
          chatRooms.map(room => (
            <button 
              key={room.id} 
              className="chat-room-item" 
              onClick={() => navigate(`/chat/${room.id}`, {
                state: {
                  productId: room.productId
                }
              })}
            >
              <div 
                className="chat-partner-avatar" 
                style={{
                  backgroundImage: room.partner.avatarUrl ? `url(${room.partner.avatarUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  minWidth: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: '#666',
                  flexShrink: 0,
                  marginRight: '15px'
                }}
              >
                {!room.partner.avatarUrl && room.partner.nickname?.charAt(0)?.toUpperCase()}
              </div>
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
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>채팅방이 없습니다.</div>
        )}
      </main>
    </div>
  );
}

export default ChatListPage;