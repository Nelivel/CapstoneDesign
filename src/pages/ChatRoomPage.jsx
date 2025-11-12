// src/pages/ChatRoomPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import { useGlobalData } from '../context/GlobalContext'; // GlobalContext 훅
import { getAllMessages, getMessagesByProduct, markMessageAsRead, markAllMessagesAsRead } from '../api/messageApi'; // 백엔드 메시지 API
import { getProductById, mapBackendLocationToFrontend } from '../api/productApi'; // 상품 정보 API
import { getMe } from '../api/authApi'; // 사용자 정보 API
import { QRCodeSVG } from 'qrcode.react'; // QR 코드 라이브러리
import {
  getRemoteTradeSession,
  sellerStartRemoteTrade,
  sellerCompleteRemoteTrade,
  buyerPayRemoteTrade,
  buyerCompleteRemoteTrade,
  proposePriceRemoteTrade,
  respondPriceProposal,
} from '../api/remoteTradeApi';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090').replace(/\/$/, '');
const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || API_BASE_URL.replace(/^http/, 'ws')).replace(/\/$/, '');

const REMOTE_SESSION_POLL_INTERVAL = 5000;
const DEFAULT_WALLET_BALANCE = 50000;

const getWalletKey = (userId) => (userId ? `virtualWallet_${userId}` : null);

const readWalletBalance = (userId) => {
  const key = getWalletKey(userId);
  if (!key) return DEFAULT_WALLET_BALANCE;
  try {
    const stored = localStorage.getItem(key);
    if (stored === null || stored === undefined) return DEFAULT_WALLET_BALANCE;
    const parsed = Number(stored);
    if (Number.isNaN(parsed)) return DEFAULT_WALLET_BALANCE;
    return parsed;
  } catch (err) {
    console.warn('Wallet read failure:', err);
    return DEFAULT_WALLET_BALANCE;
  }
};

const writeWalletBalance = (userId, balance) => {
  const key = getWalletKey(userId);
  if (!key) return;
  try {
    localStorage.setItem(key, String(Math.max(0, Math.round(balance))));
  } catch (err) {
    console.warn('Wallet write failure:', err);
  }
};

// 컴포넌트 임포트
import ProductTradeHeader from '../components/ProductTradeHeader';
import PriceAdjustModal from '../components/PriceAdjustModal';
import ChatFeaturesModal from '../components/ChatFeaturesModal';
import TradeScheduleRecommendModal from '../components/TradeScheduleRecommendModal';
import RemoteGuideStepperModal from '../components/RemoteGuideStepperModal';
import SellerDepositModal from '../components/SellerDepositModal';
import BuyerPickupModal from '../components/BuyerPickupModal';

import './ChatRoomPage.css';

const MY_USER_ID = 'me'; // 현재 사용자 ID (임시)

function ChatRoomPage() {
  const { chatId } = useParams();
  const { navigate } = useNavigation();
  const location = useLocation();
  const { products, updateProduct, user: contextUser } = useGlobalData(); // GlobalContext 사용
  const [currentUser, setCurrentUser] = useState(null); // 현재 사용자 정보 (API에서 직접 로드)

  const [messages, setMessages] = useState([]);
  const [wsStatus, setWsStatus] = useState('idle');
  const [newMessage, setNewMessage] = useState('');
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [fileCaptureMode, setFileCaptureMode] = useState('any');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [remoteSession, setRemoteSession] = useState(null);
  const [remoteSessionLoading, setRemoteSessionLoading] = useState(true);
  const [remoteSessionError, setRemoteSessionError] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [walletBalance, setWalletBalance] = useState(DEFAULT_WALLET_BALANCE);
  const remoteSessionPollRef = useRef(null);
  const markAllReadOnceRef = useRef(false);
  const [partnerUserId, setPartnerUserId] = useState(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [sellerModalStep, setSellerModalStep] = useState(0);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [buyerModalStep, setBuyerModalStep] = useState(0);

  const applySessionUpdate = useCallback((session) => {
    setRemoteSession(session);
    if (session?.currentPrice !== undefined && session?.currentPrice !== null) {
      const numericPrice = Number(session.currentPrice);
      if (!Number.isNaN(numericPrice)) {
        setCurrentPrice(numericPrice);
      }
    }
  }, [setCurrentPrice]);

  // 모달 상태
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false); // 가격 조정 모달

  // productId는 location.state에서 받거나, chatId를 productId로 사용
  // chatId가 문자열일 수 있으므로 Number 변환 시도
  const [productIdState, setProductIdState] = useState(() => {
    // 초기값: location.state에서 가져오거나, chatId를 productId로 사용
    const stateProductId = location.state?.productId;
    if (stateProductId) {
      return stateProductId;
    }
    if (chatId) {
      const numericChatId = Number(chatId);
      return !isNaN(numericChatId) ? numericChatId : chatId;
    }
    return null;
  });
  
  // location.state가 나중에 업데이트될 수 있으므로 useEffect로 감시
  useEffect(() => {
    if (location.state?.productId) {
      setProductIdState(location.state.productId);
    } else if (!productIdState && chatId) {
      // location.state가 없으면 chatId를 productId로 사용
      const numericChatId = Number(chatId);
      const newProductId = !isNaN(numericChatId) ? numericChatId : chatId;
      setProductIdState(newProductId);
    }
  }, [location.state, chatId]);
  
  const productId = productIdState;
  
  // 상대방 정보 (상품 정보 로드 후 판매자 정보 사용)
  const [partnerInfo, setPartnerInfo] = useState(null);

  // 상품 정보 상태
  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState(null);

  const currentUserId = currentUser?.id ? Number(currentUser.id) : null;
  const productSellerId = product?.sellerId ? Number(product.sellerId) : null;
  const isSellerView = Boolean(currentUserId !== null && productSellerId !== null && currentUserId === productSellerId);
  const isBuyerView = Boolean(currentUserId !== null && !isSellerView);
  const isRemoteTrade = product?.tradeType === 'NONE_PERSON';

  const tradePhase = remoteSession?.phase ?? 'IDLE';

  const sellerButtonLabel = (() => {
    switch (tradePhase) {
      case 'IDLE':
        return '물품 등록하기';
      case 'SELLER_QR':
        return 'QR코드/보관함 보기';
      case 'SELLER_DEPOSITED':
        return '보관함 확인하기';
      case 'BUYER_QR':
        return '구매자 결제 대기 중';
      case 'COMPLETED':
        return '거래 완료';
      default:
        return '거래 진행';
    }
  })();

  const sellerButtonDisabled = tradePhase === 'COMPLETED';

  const buyerButtonLabel = (() => {
    switch (tradePhase) {
      case 'SELLER_DEPOSITED':
        return '결제 후 물품 수령';
      case 'BUYER_QR':
        return '수령 QR 보기';
      case 'COMPLETED':
        return '거래 완료';
      default:
        return '거래 대기 중';
    }
  })();

  const buyerButtonDisabled = !(tradePhase === 'SELLER_DEPOSITED' || tradePhase === 'BUYER_QR');

  const remotePhaseLabel = (() => {
    switch (tradePhase) {
      case 'IDLE':
        return '대기 중';
      case 'SELLER_QR':
        return 'QR 발급';
      case 'SELLER_DEPOSITED':
        return '보관 완료';
      case 'BUYER_QR':
        return '결제 완료';
      case 'COMPLETED':
        return '거래 완료';
      default:
        return '진행 중';
    }
  })();

  const remotePhaseDescription = (() => {
    switch (tradePhase) {
      case 'IDLE':
        return '판매자가 물품 등록을 시작하면 안내가 표시됩니다.';
      case 'SELLER_QR':
        return '키오스크에서 QR을 스캔해 물품을 보관해주세요.';
      case 'SELLER_DEPOSITED':
        return '물품 보관이 완료되었습니다. 구매자의 결제를 기다리는 중입니다.';
      case 'BUYER_QR':
        return '구매자가 결제를 완료했습니다. 수령 절차를 진행해주세요.';
      case 'COMPLETED':
        return '거래가 완료되었습니다.';
      default:
        return '거래 정보를 불러오는 중입니다.';
    }
  })();

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

  useEffect(() => {
    if (currentUser?.id) {
      setWalletBalance(readWalletBalance(currentUser.id));
    }
  }, [currentUser?.id]);

  // 상품 정보 로드
  useEffect(() => {
    console.log('ChatRoomPage: useEffect triggered', { productId, chatId, locationState: location.state });
    
    if (!productId) {
      console.log('ChatRoomPage: productId is missing', { productId, chatId, locationState: location.state });
      setProductLoading(false);
      setProductError('상품 ID가 없습니다. 채팅 목록에서 상품을 선택해주세요.');
      return;
    }

    console.log('ChatRoomPage: Loading product with productId:', productId);

    (async () => {
      try {
        setProductLoading(true);
        setProductError(null);
        
        // 백엔드에서 상품 정보 가져오기
        const backendProduct = await getProductById(productId);
        if (backendProduct) {
          console.log('ChatRoomPage: Product loaded from backend:', backendProduct);
          // 백엔드 상품 정보를 프론트엔드 형식으로 변환
          const sellerNickname = backendProduct.seller?.nickname || backendProduct.seller?.username || 'Unknown Seller';
          const frontendProduct = {
            id: backendProduct.id,
            sellerId: backendProduct.seller?.id || null,
            sellerNickname: sellerNickname,
            sellerHasTimetable: true, // TODO: 실제 시간표 유무 확인
            title: backendProduct.productName || '제목 없음',
            nickname: sellerNickname,
            description: backendProduct.productDescription || '',
            price: backendProduct.productPrice ? Number(backendProduct.productPrice) : 0,
            status: backendProduct.status === 'ON_SALE' ? 'selling' : 
                    backendProduct.status === 'RESERVED' ? 'reserved' : 
                    backendProduct.status === 'SOLD_OUT' ? 'sold' : 'selling',
            category: backendProduct.category,
            createdAt: backendProduct.createdAt || new Date().toISOString(),
            viewCount: backendProduct.viewCount || 0,
            imageUrl: backendProduct.imageUrl || null,
            tradeType: mapBackendLocationToFrontend(backendProduct.location || backendProduct.tradeType),
          };
          setProduct(frontendProduct);
          setCurrentPrice(frontendProduct.price);
          
          // 상대방 정보 설정
          setPartnerInfo({
            nickname: sellerNickname,
            avatarUrl: '', // 기본 아바타 없음
            userId: backendProduct.seller?.id || null,
          });
          
          console.log('ChatRoomPage: Product set successfully');
        } else {
          console.warn('ChatRoomPage: Product not found in backend, trying GlobalContext');
          // 백엔드에서 못 찾았으면 GlobalContext에서 찾기
          const ctxProduct = products.find(p => {
            const pId = Number(p.id);
            const prodId = Number(productId);
            return !isNaN(pId) && !isNaN(prodId) && pId === prodId;
          });
          if (ctxProduct) {
            console.log('ChatRoomPage: Product found in GlobalContext');
            setProduct({
              ...ctxProduct,
              tradeType: ctxProduct.tradeType || mapBackendLocationToFrontend(ctxProduct.location || ctxProduct.tradeType),
            });
            setCurrentPrice(ctxProduct.price);
            
            // 상대방 정보 설정
            setPartnerInfo({
              nickname: ctxProduct.sellerNickname || ctxProduct.nickname || 'Unknown',
              avatarUrl: '', // 기본 아바타 없음
              userId: ctxProduct.sellerId || null,
            });
          } else {
            console.error('ChatRoomPage: Product not found anywhere', { productId, productsCount: products.length });
            setProductError('상품 정보를 찾을 수 없습니다. (상품 ID: ' + productId + ')');
          }
        }
      } catch (err) {
        console.error('ChatRoomPage: Product load error:', err);
        setProductError('상품 정보를 불러오는데 실패했습니다: ' + (err.response?.data?.message || err.message));
        
        // 실패 시 GlobalContext에서 찾기
        try {
          const ctxProduct = products.find(p => {
            const pId = Number(p.id);
            const prodId = Number(productId);
            return !isNaN(pId) && !isNaN(prodId) && pId === prodId;
          });
          if (ctxProduct) {
            console.log('ChatRoomPage: Product found in GlobalContext after error');
            setProduct(ctxProduct);
            setCurrentPrice(ctxProduct.price);
            setProductError(null);
            
            // 상대방 정보 설정
            setPartnerInfo({
              nickname: ctxProduct.sellerNickname || ctxProduct.nickname || 'Unknown',
              avatarUrl: '', // 기본 아바타 없음
              userId: ctxProduct.sellerId || null,
            });
          }
        } catch (e) {
          console.error('ChatRoomPage: Failed to find product in GlobalContext:', e);
        }
      } finally {
        setProductLoading(false);
      }
    })();
  }, [productId, products]);

  // WebSocket 연결 관리
  const wsRef = useRef(null);

  // 초기 메시지 로드 및 읽음 처리
  useEffect(() => {
    if (!productId || !product || !currentUser) return;

    // 백엔드에서 상품별 메시지 로드
    (async () => {
      try {
        console.log('Loading messages for productId:', productId);
        const backendMessages = await getMessagesByProduct(productId);
        console.log('Loaded messages:', backendMessages);
        
        // 백엔드 Message 엔티티를 프론트 형식으로 변환
        const converted = backendMessages.map(msg => {
          const msgUserId = msg.user?.id ? Number(msg.user.id) : null;
          const currentUserId = currentUser?.id ? Number(currentUser.id) : null;
          const isMyMessage = msgUserId !== null && currentUserId !== null && msgUserId === currentUserId;
          
          // readBy 배열에서 현재 사용자가 읽었는지 확인
          const isReadByMe = msg.readBy && Array.isArray(msg.readBy) && 
            msg.readBy.some(r => {
              const rId = r?.id ? Number(r.id) : null;
              return rId !== null && currentUserId !== null && rId === currentUserId;
            });

          let messageType = 'text';
          let textContent = msg.content || '';
          let imagePayload = null;
          let qrPayload = null;
          if (typeof msg.content === 'string') {
            try {
              const parsed = JSON.parse(msg.content);
              if (parsed && typeof parsed === 'object') {
                if (parsed.kind === 'IMAGE' && parsed.dataUrl) {
                  messageType = 'image';
                  imagePayload = parsed;
                  textContent = parsed.caption || '';
                } else if (parsed.type === 'SIM_QR') {
                  messageType = 'system_qr';
                  qrPayload = { qrCode: parsed.qrCode, for: parsed.for };
                  textContent = parsed.text || '';
                } else if (parsed.type) {
                  messageType = 'system';
                  textContent = parsed.message || textContent;
                }
              }
            } catch (err) {
              // JSON 파싱 실패 시 무시하고 텍스트로 간주
            }
          }
          
          return {
            id: msg.id,
            sender: isMyMessage ? 'me' : 'partner',
            content: msg.content,
            text: textContent,
            nickname: msg.nickname,
            timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            type: messageType,
            imageUrl: imagePayload?.dataUrl || null,
            imageMeta: imagePayload,
            isRead: isMyMessage ? true : isReadByMe,
            createdAt: msg.createdAt,
            user: msg.user,
            readBy: msg.readBy,
            qrCode: qrPayload?.qrCode || null,
            for: qrPayload?.for || null,
          };
        });
        setMessages(converted);
        
        // 상대방이 보낸 읽지 않은 메시지를 읽음 처리
        const currentUserId = currentUser?.id ? Number(currentUser.id) : null;
        const unreadMessages = converted.filter(msg => {
          if (msg.sender !== 'partner' || !msg.id) return false;
          
          // readBy 배열에 현재 사용자가 없으면 읽지 않은 것으로 간주
          if (!currentUserId) return false;
          
          const isReadByMe = msg.readBy && Array.isArray(msg.readBy) && 
            msg.readBy.some(r => {
              const rId = r?.id ? Number(r.id) : null;
              return rId !== null && currentUserId !== null && rId === currentUserId;
            });
          
          return !isReadByMe;
        });
        
        console.log('ChatRoomPage: Total messages:', converted.length, 'Unread messages:', unreadMessages.length);
        
        // 읽지 않은 메시지 읽음 처리 (WebSocket이 연결되면 전송 + 낙관적 업데이트)
        if (unreadMessages.length > 0) {
          console.log('ChatRoomPage: Found unread messages:', unreadMessages.map(m => ({ id: m.id, content: m.content?.substring(0, 20) })));
          
          // 낙관적 업데이트: READ 메시지를 보내기 전에 로컬 상태를 먼저 업데이트
          if (currentUserId) {
            setMessages(prev => prev.map(msg => {
              const isUnread = unreadMessages.some(um => um.id === msg.id);
              if (isUnread) {
                // readBy 배열에 현재 사용자 추가
                const updatedReadBy = msg.readBy && Array.isArray(msg.readBy) ? [...msg.readBy] : [];
                const alreadyInReadBy = updatedReadBy.some(r => {
                  const rId = r?.id ? Number(r.id) : null;
                  return rId !== null && currentUserId !== null && rId === currentUserId;
                });
                
                if (!alreadyInReadBy) {
                  updatedReadBy.push({ id: currentUserId });
                  console.log('ChatRoomPage: ✅ Optimistically added current user to readBy for message:', msg.id);
                }
                
                return {
                  ...msg,
                  readBy: updatedReadBy,
                  isRead: true
                };
              }
              return msg;
            }));
          }
          
          // WebSocket 연결을 기다리는 함수 (더 강력한 재시도)
          const waitForWebSocketAndMarkAsRead = () => {
            let attempts = 0;
            const maxAttempts = 100; // 10초 동안 시도 (100ms * 100)
            
            const tryMarkAsRead = () => {
              attempts++;
              
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                console.log('ChatRoomPage: WebSocket is open, marking', unreadMessages.length, 'messages as read');
                let successCount = 0;
                unreadMessages.forEach(msg => {
                  if (msg.id) {
                    try {
                      const readMessage = {
                        type: 'READ',
                        messageId: msg.id,
                        productId: productId // productId 포함
                      };
                      wsRef.current.send(JSON.stringify(readMessage));
                      successCount++;
                      console.log('ChatRoomPage: ✅ Sent READ message for messageId:', msg.id, 'productId:', productId);
                    } catch (error) {
                      console.error('ChatRoomPage: ❌ Failed to send read message via WebSocket:', error, 'messageId:', msg.id);
                    }
                  }
                });
                console.log('ChatRoomPage: Successfully sent', successCount, 'out of', unreadMessages.length, 'READ messages');
                return true;
              }
              
              if (attempts < maxAttempts) {
                if (attempts % 10 === 0) {
                  console.log('ChatRoomPage: Waiting for WebSocket connection... attempt', attempts, '/', maxAttempts, 'wsRef.current:', wsRef.current ? 'exists' : 'null', 'readyState:', wsRef.current?.readyState);
                }
                setTimeout(tryMarkAsRead, 100);
              } else {
                console.error('ChatRoomPage: ❌ WebSocket connection timeout after', maxAttempts, 'attempts. Could not mark messages as read.');
                console.error('ChatRoomPage: WebSocket state:', {
                  wsRefExists: !!wsRef.current,
                  readyState: wsRef.current?.readyState,
                  readyStateText: wsRef.current?.readyState === WebSocket.OPEN ? 'OPEN' : 
                                 wsRef.current?.readyState === WebSocket.CONNECTING ? 'CONNECTING' : 
                                 wsRef.current?.readyState === WebSocket.CLOSING ? 'CLOSING' : 
                                 wsRef.current?.readyState === WebSocket.CLOSED ? 'CLOSED' : 'UNKNOWN'
                });
              }
              
              return false;
            };
            
            tryMarkAsRead();
          };
          
          // WebSocket 연결 대기 후 읽음 처리
          waitForWebSocketAndMarkAsRead();
        } else {
          console.log('ChatRoomPage: No unread messages found');
        }
      } catch (e) {
        console.error('메시지 로드 실패:', e);
        console.error('Error details:', e.response?.status, e.response?.data);
        setMessages([]);
      }
    })();
  }, [productId, product, currentUser?.id]); // productId, product, currentUser.id가 변경될 때만 실행

  // WebSocket 연결 (별도 useEffect로 분리)
  useEffect(() => {
    if (!currentUser || !currentUser.username || !productId) {
      // 연결 조건이 맞지 않으면 기존 연결 정리
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    // 기존 연결이 있으면 먼저 정리
    if (wsRef.current) {
      console.log('Closing existing WebSocket connection');
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = `${WS_BASE_URL}/chatserver/${currentUser.username}`;
    console.log('Connecting to WebSocket:', wsUrl);
    setWsStatus('connecting');
    const ws = new WebSocket(wsUrl);
    
    let isConnecting = true;
    let reconnectTimeout = null;
    
    ws.onopen = () => {
      console.log('ChatRoomPage: ✅ WebSocket connected successfully');
      setWsStatus('connected');
      isConnecting = false;
      
      // WebSocket 연결 후 약간의 지연을 두고 읽지 않은 메시지 확인
      // messages 상태가 업데이트될 때까지 기다림
      setTimeout(() => {
        // messages 상태를 직접 참조할 수 없으므로, 메시지 로드 useEffect에서 처리하도록 함
        console.log('ChatRoomPage: WebSocket ready, waiting for messages to be loaded and marked as read');
      }, 500);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        if (data.type === 'TALK') {
          // productId 비교 (숫자로 변환하여 비교)
          const msgProductId = data.productId ? Number(data.productId) : null;
          const currentProductId = productId ? Number(productId) : null;
          if (msgProductId === currentProductId) {
            // 상품 ID가 일치하는 메시지만 추가
            const isMyMessage = data.nickname === currentUser.nickname;
            let incomingType = 'text';
            let textContent = data.content;
            let imagePayload = null;
            let qrPayload = null;
            if (typeof data.content === 'string') {
              try {
                const parsed = JSON.parse(data.content);
                if (parsed && typeof parsed === 'object') {
                  if (parsed.kind === 'IMAGE' && parsed.dataUrl) {
                    incomingType = 'image';
                    imagePayload = parsed;
                    textContent = parsed.caption || '';
                  } else if (parsed.type === 'SIM_QR') {
                    incomingType = 'system_qr';
                    qrPayload = { qrCode: parsed.qrCode, for: parsed.for };
                    textContent = parsed.text || '';
                  } else if (parsed.type) {
                    incomingType = 'system';
                    textContent = parsed.message || textContent;
                  }
                }
              } catch (err) {
                // ignore parse error
              }
            }
            const newMsg = {
              id: data.messageId || Date.now(),
              sender: isMyMessage ? 'me' : 'partner',
              content: data.content,
              text: textContent,
              nickname: data.nickname,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: incomingType,
              imageUrl: imagePayload?.dataUrl || null,
              imageMeta: imagePayload,
              isRead: isMyMessage ? true : false, // 자신이 보낸 메시지는 즉시 읽음 처리
              createdAt: data.createdAt,
              user: data.user,
              readBy: data.readBy,
              qrCode: qrPayload?.qrCode || null,
              for: qrPayload?.for || null,
            };
            setMessages(prev => {
              // 중복 방지: 이미 같은 ID의 메시지가 있으면 추가하지 않음
              const exists = prev.some(m => m.id === newMsg.id);
              if (exists) return prev;
              return [...prev, newMsg];
            });
            if (!isMyMessage) {
              window.dispatchEvent(new CustomEvent('chat:new-message', {
                detail: {
                  productId: msgProductId,
                  content: data.content,
                  incoming: true,
                },
              }));
            }
          }
        } else if (data.type === 'READ') {
          // 읽음 처리 메시지 수신 (상대방이 내 메시지를 읽었을 때 또는 내가 상대방 메시지를 읽었을 때)
          const readMessageId = data.messageId ? Number(data.messageId) : null;
          const readProductId = data.productId ? Number(data.productId) : null;
          const readByUserId = data.readByUserId ? Number(data.readByUserId) : null; // 백엔드에서 전송한 읽은 사용자 ID
          
          if (readMessageId) {
            console.log('ChatRoomPage: Received READ message for messageId:', readMessageId, 'productId:', readProductId, 'readByUserId:', readByUserId);
            
            // 현재 상품의 메시지인지 확인
            const currentProductId = productId ? Number(productId) : null;
            if (readProductId && currentProductId && readProductId !== currentProductId) {
              console.log('ChatRoomPage: READ message is for different product, ignoring');
              return;
            }
            
            // 메시지 목록에서 해당 메시지를 찾아 readBy 배열 업데이트
            setMessages(prev => {
              const updated = prev.map(msg => {
                if (msg.id === readMessageId) {
                  console.log('ChatRoomPage: Marking message as read:', msg.id);
                  // readBy 배열에 읽은 사용자 추가 (없는 경우에만)
                  const updatedReadBy = msg.readBy && Array.isArray(msg.readBy) ? [...msg.readBy] : [];
                  
                  // 백엔드에서 전송한 읽은 사용자 ID 사용 (없으면 현재 사용자 ID 사용)
                  const userIdToAdd = readByUserId || (currentUser?.id ? Number(currentUser.id) : null);
                  
                  if (userIdToAdd) {
                    // 이미 readBy에 있는지 확인
                    const alreadyInReadBy = updatedReadBy.some(r => {
                      const rId = r?.id ? Number(r.id) : null;
                      return rId !== null && currentUserId !== null && rId === currentUserId;
                    });
                    
                    if (!alreadyInReadBy) {
                      updatedReadBy.push({ id: userIdToAdd });
                      console.log('ChatRoomPage: ✅ Added userId', userIdToAdd, 'to readBy array for message:', msg.id);
                    } else {
                      console.log('ChatRoomPage: User', userIdToAdd, 'already in readBy for message:', msg.id);
                    }
                  }
                  
                  // 현재 사용자가 읽었는지 확인하여 isRead 업데이트
                  const currentUserId = currentUser?.id ? Number(currentUser.id) : null;
                  const isReadByMe = currentUserId && updatedReadBy.some(r => {
                    const rId = r?.id ? Number(r.id) : null;
                    return rId !== null && currentUserId !== null && rId === currentUserId;
                  });
                  
                  return { 
                    ...msg, 
                    isRead: isReadByMe || msg.isRead, // 현재 사용자가 읽었거나 이미 읽음 상태면 true
                    readBy: updatedReadBy
                  };
                }
                return msg;
              });
              
              // 변경사항이 있는지 확인
              const hasChanges = updated.some((msg, idx) => {
                const original = prev[idx];
                return msg.id === readMessageId && 
                       JSON.stringify(msg.readBy) !== JSON.stringify(original?.readBy);
              });
              
              if (hasChanges) {
                console.log('ChatRoomPage: ✅ Updated readBy for message:', readMessageId, 'readBy:', updated.find(m => m.id === readMessageId)?.readBy);
              }
              
              return updated;
            });
          }
        }
      } catch (e) {
        console.error('WebSocket message parse error:', e);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsStatus('error');
      isConnecting = false;
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setWsStatus('closed');
      isConnecting = false;
      // 정상 종료(1000)가 아니면 재연결 시도 (단, cleanup으로 인한 종료는 제외)
      if (event.code !== 1000 && wsRef.current === ws) {
        console.log('WebSocket closed unexpectedly, will not reconnect automatically');
      }
    };
    
    wsRef.current = ws;
    
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (wsRef.current === ws) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
        setWsStatus('closed');
      }
    };
  }, [currentUser?.username, productId]); // username과 productId만 변경될 때 재연결

  // 상품 상태 변경 감지 후 시스템 메시지 추가 (초기 로드 시에만)
  const [initialProductStatus, setInitialProductStatus] = useState(null);
  
  useEffect(() => {
    // 초기 상품 상태 저장 (한 번만)
    if (product && initialProductStatus === null) {
      setInitialProductStatus(product.status);
    }
  }, [product, initialProductStatus]);

  // 상품 상태가 실제로 변경되었을 때만 시스템 메시지 추가
  useEffect(() => {
    // product 상태가 유효하고, 초기 상태가 설정되어 있고, 상태가 실제로 변경되었을 때만
    if (product && initialProductStatus !== null && product.status !== initialProductStatus) {
        const statusText = product.status === 'reserved' ? '예약 중' : product.status === 'sold' ? '판매 완료' : '판매 중';
        const expectedMessage = `상품 상태가 '${statusText}'(으)로 변경되었습니다.`;

      // 중복 체크 후 메시지 추가
      const lastMessage = messages[messages.length - 1];
      if (!(lastMessage?.type === 'system' && lastMessage?.text === expectedMessage)) {
               addSystemMessage(expectedMessage);
        // 초기 상태 업데이트 (다음 변경을 위해)
        setInitialProductStatus(product.status);
            }
        }
  }, [product?.status]); // messages.length 제거 - 메시지 추가와 무관하게 상태 변경만 감지


  // 스크롤 맨 아래로
  useEffect(() => {
    // 메시지 목록이 업데이트될 때마다 맨 아래로 스크롤
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 이미 READ 메시지를 보낸 메시지 ID 추적 (무한 루프 방지)
  const sentReadMessagesRef = useRef(new Set());
  
  // messages 상태가 변경될 때마다 읽지 않은 메시지 확인 및 읽음 처리
  useEffect(() => {
    if (!productId || !currentUser || messages.length === 0) return;
    
    // 상대방이 보낸 읽지 않은 메시지 찾기 (readBy 배열을 확인하여 정확히 판단)
    const currentUserId = currentUser?.id ? Number(currentUser.id) : null;
    const unreadMessages = messages.filter(msg => {
      if (msg.sender !== 'partner' || !msg.id) return false;
      
      // 이미 READ 메시지를 보낸 메시지는 제외
      if (sentReadMessagesRef.current.has(msg.id)) {
        return false;
      }
      
      // readBy 배열에 현재 사용자가 없으면 읽지 않은 것으로 간주
      if (!currentUserId) return false;
      
      const isReadByMe = msg.readBy && Array.isArray(msg.readBy) && 
        msg.readBy.some(r => {
          const rId = r?.id ? Number(r.id) : null;
          return rId !== null && currentUserId !== null && rId === currentUserId;
        });
      
      return !isReadByMe;
    });
    
    if (unreadMessages.length > 0 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('ChatRoomPage: Messages updated, found', unreadMessages.length, 'unread messages (based on readBy), marking as read...');
      unreadMessages.forEach(msg => {
        if (msg.id) {
          try {
            const readMessage = {
              type: 'READ',
              messageId: msg.id,
              productId: productId
            };
            wsRef.current.send(JSON.stringify(readMessage));
            // READ 메시지를 보낸 메시지 ID 기록
            sentReadMessagesRef.current.add(msg.id);
            console.log('ChatRoomPage: ✅ Sent READ message (from messages useEffect) for messageId:', msg.id, 'productId:', productId);
            window.dispatchEvent(new CustomEvent('chat:messages-read', { detail: { productId } }));
          } catch (error) {
            console.error('ChatRoomPage: ❌ Failed to send read message (from messages useEffect):', error);
          }
        }
      });
    }
  }, [messages, productId, currentUser?.id]); // messages가 변경될 때마다 실행

  // 시스템 메시지 추가 함수
  const notify = (message) => {
    if (!message) return;
    window.dispatchEvent(new CustomEvent('app:notify', { detail: { message } }));
  };

  const getCurrentWalletBalance = () => {
    if (Number.isFinite(walletBalance)) return walletBalance;
    if (currentUser?.id) return readWalletBalance(currentUser.id);
    return DEFAULT_WALLET_BALANCE;
  };

  const adjustWallet = (userId, delta) => {
    if (!userId || !delta) return;
    const current = readWalletBalance(userId);
    const next = Math.max(0, current + delta);
    writeWalletBalance(userId, next);
    if (currentUser?.id === userId) {
      setWalletBalance(next);
    }
  };

  const rechargeCurrentUser = (amount) => {
    if (!currentUser?.id || !amount) return;
    const base = getCurrentWalletBalance();
    const next = base + amount;
    setWalletBalance(next);
    writeWalletBalance(currentUser.id, next);
    notify(`${amount.toLocaleString('ko-KR')}원을 충전했습니다.`);
  };

  const addSystemMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      type: 'system', // 시스템 메시지 타입
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    // 상태 업데이트 함수 내에서 중복 체크 한번 더 (시간차 동기화 문제 방지)
    setMessages(prev => {
        const lastMsg = prev[prev.length -1];
        // 마지막 메시지가 시스템 메시지이고 내용이 같다면 추가하지 않음
        if(lastMsg?.type === 'system' && lastMsg?.text === text){
            return prev;
        }
        return [...prev, newMsg]; // 새 메시지 추가
    });
  };

  const loadRemoteSession = useCallback(
    async (targetProductId, { silent = false } = {}) => {
      if (!isRemoteTrade || !targetProductId) {
        return null;
      }

      if (!silent) {
        setRemoteSessionLoading(true);
        setRemoteSessionError(null);
      }

      try {
        const data = await getRemoteTradeSession(targetProductId);
        applySessionUpdate(data);
        setRemoteSessionError(null);
        return data;
      } catch (error) {
        const message = error.message || '거래 상태를 불러오지 못했습니다.';
        setRemoteSessionError(message);
        if (!silent) {
          notify(message);
        } else {
          console.warn('Remote trade session load failed:', message);
        }
        return null;
      } finally {
        if (!silent) {
          setRemoteSessionLoading(false);
        }
      }
    },
    [applySessionUpdate, isRemoteTrade, notify]
  );

  const handleRemoteTradeAction = () => {
    if (!isRemoteTrade) {
      notify('비대면 거래에서만 이용 가능한 기능입니다.');
      return;
    }
    if (!productId) {
      notify('상품 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    if (isSellerView) {
      handleSellerTradeAction();
    } else if (isBuyerView) {
      handleBuyerTradeAction();
    } else {
      notify('판매자 또는 구매자만 이용할 수 있는 기능입니다.');
    }
  };

  const handleSellerTradeAction = async () => {
    if (!productId) return;
    if (!isSellerView) {
      notify('판매자만 물품 보관을 진행할 수 있습니다.');
      return;
    }

    try {
      if (tradePhase === 'IDLE') {
        setRemoteSessionLoading(true);
        const session = await sellerStartRemoteTrade(productId);
        applySessionUpdate(session);
        setSellerModalStep(0);
        setIsSellerModalOpen(true);
        notify('판매자용 QR이 생성되었습니다. 키오스크에서 스캔해주세요.');
      } else if (tradePhase === 'SELLER_QR') {
        setSellerModalStep(0);
        setIsSellerModalOpen(true);
      } else if (tradePhase === 'SELLER_DEPOSITED') {
        setSellerModalStep(1);
        setIsSellerModalOpen(true);
      } else if (tradePhase === 'BUYER_QR') {
        setSellerModalStep(1);
        setIsSellerModalOpen(true);
        notify('구매자의 결제를 기다리는 중입니다.');
      } else if (tradePhase === 'COMPLETED') {
        notify('거래가 이미 완료되었습니다.');
      }
    } catch (error) {
      notify(error.message || '물품 등록 처리 중 오류가 발생했습니다.');
    } finally {
      setRemoteSessionLoading(false);
    }
  };

  const handleSellerComplete = async () => {
    if (!productId) return;
    try {
      setRemoteSessionLoading(true);
      const session = await sellerCompleteRemoteTrade(productId);
      applySessionUpdate(session);
      notify('물품 보관이 완료되었습니다. 구매자의 결제를 기다립니다.');
      setIsSellerModalOpen(false);
      loadRemoteSession(productId, { silent: true });
    } catch (error) {
      notify(error.message || '보관 완료 처리 중 오류가 발생했습니다.');
    } finally {
      setRemoteSessionLoading(false);
    }
  };

  const handleBuyerTradeAction = () => {
    if (!isBuyerView) {
      notify('구매자만 이용할 수 있는 기능입니다.');
      return;
    }
    if (!isRemoteTrade) {
      notify('비대면 거래에서만 이용 가능한 기능입니다.');
      return;
    }
    if (tradePhase === 'SELLER_DEPOSITED') {
      setBuyerModalStep(0);
      setIsBuyerModalOpen(true);
    } else if (tradePhase === 'BUYER_QR') {
      setBuyerModalStep(1);
      setIsBuyerModalOpen(true);
    } else if (tradePhase === 'COMPLETED') {
      notify('거래가 이미 완료되었습니다.');
    } else {
      notify('판매자가 물품 등록을 완료하면 결제를 진행할 수 있습니다.');
    }
  };

  const handleBuyerPayment = async () => {
    if (!currentUser?.id || !productId) return null;
    if (tradePhase !== 'SELLER_DEPOSITED' && tradePhase !== 'BUYER_QR') {
      notify('결제를 진행할 수 있는 상태가 아닙니다.');
      return null;
    }

    const amountSource = remoteSession?.currentPrice ?? currentPrice;
    const numericAmount = Number(amountSource);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      notify('결제 금액 정보를 불러오지 못했습니다.');
      return null;
    }

    const balance = getCurrentWalletBalance();
    if (balance < numericAmount) {
      notify('잔액이 부족합니다. 충전 후 다시 시도해주세요.');
      return null;
    }

    try {
      setRemoteSessionLoading(true);
      const session = await buyerPayRemoteTrade(productId, numericAmount);
      adjustWallet(currentUser.id, -numericAmount);
      applySessionUpdate(session);
      setBuyerModalStep(1);
      notify('결제가 완료되었습니다. 수령용 QR이 발급되었습니다.');
      return session;
    } catch (error) {
      notify(error.message || '결제 처리 중 오류가 발생했습니다.');
      return null;
    } finally {
      setRemoteSessionLoading(false);
    }
  };

  const handleBuyerComplete = async () => {
    if (!currentUser?.id || !productId) return null;
    if (tradePhase !== 'BUYER_QR') {
      notify('수령을 진행할 수 있는 상태가 아닙니다.');
      return null;
    }

    const amountSource = remoteSession?.buyerEscrowAmount ?? remoteSession?.currentPrice ?? currentPrice;
    const numericAmount = Number(amountSource);

    try {
      setRemoteSessionLoading(true);
      const session = await buyerCompleteRemoteTrade(productId);
      applySessionUpdate(session);

      const sellerId = product?.sellerId;
      if (sellerId && numericAmount && !Number.isNaN(numericAmount)) {
        adjustWallet(sellerId, numericAmount);
        if (currentUserId === sellerId) {
          notify(`${numericAmount.toLocaleString('ko-KR')}원이 정산되었습니다.`);
        }
      }

      notify('수령이 완료되었습니다.');
      setIsBuyerModalOpen(false);
      return session;
    } catch (error) {
      notify(error.message || '수령 완료 처리 중 오류가 발생했습니다.');
      return null;
    } finally {
      setRemoteSessionLoading(false);
    }
  };

  const handlePriceAdjustSave = async (newPrice) => {
    if (!productId) return;
    const numericPrice = Number(newPrice);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      notify('올바른 가격을 입력해주세요.');
      return;
    }

    try {
      setRemoteSessionLoading(true);
      const session = await proposePriceRemoteTrade(productId, numericPrice);
      applySessionUpdate(session);
      notify(`가격을 ${numericPrice.toLocaleString('ko-KR')}원으로 제안했습니다.`);
      setIsPriceModalOpen(false);
    } catch (error) {
      notify(error.message || '가격 제안 중 오류가 발생했습니다.');
    } finally {
      setRemoteSessionLoading(false);
    }
  };

  const handlePriceProposalDecision = async (accept) => {
    if (!productId || !remoteSession?.priceProposal?.proposalId) return;
    try {
      setRemoteSessionLoading(true);
      const session = await respondPriceProposal(productId, remoteSession.priceProposal.proposalId, accept);
      applySessionUpdate(session);
      notify(accept ? '가격 제안을 수락했습니다.' : '가격 제안을 거절했습니다.');
    } catch (error) {
      notify(error.message || '가격 제안 응답 처리 중 오류가 발생했습니다.');
    } finally {
      setRemoteSessionLoading(false);
    }
  };

  useEffect(() => {
    if (remoteSessionPollRef.current) {
      clearInterval(remoteSessionPollRef.current);
      remoteSessionPollRef.current = null;
    }

    if (!isRemoteTrade || !productId) {
      setRemoteSession(null);
      setRemoteSessionError(null);
      setRemoteSessionLoading(false);
      return;
    }

    loadRemoteSession(productId, { silent: false });

    return () => {
      if (remoteSessionPollRef.current) {
        clearInterval(remoteSessionPollRef.current);
        remoteSessionPollRef.current = null;
      }
    };
  }, [productId, isRemoteTrade, loadRemoteSession]);

  useEffect(() => {
    if (!isRemoteTrade || !productId) {
      return;
    }

    if (remoteSessionPollRef.current) {
      clearInterval(remoteSessionPollRef.current);
      remoteSessionPollRef.current = null;
    }

    if (tradePhase === 'COMPLETED') {
      return;
    }

    remoteSessionPollRef.current = setInterval(() => {
      loadRemoteSession(productId, { silent: true });
    }, REMOTE_SESSION_POLL_INTERVAL);

    return () => {
      if (remoteSessionPollRef.current) {
        clearInterval(remoteSessionPollRef.current);
        remoteSessionPollRef.current = null;
      }
    };
  }, [tradePhase, productId, isRemoteTrade, loadRemoteSession]);

  useEffect(() => {
    if (remoteSession?.currentPrice != null) {
      const numeric = Number(remoteSession.currentPrice);
      if (!Number.isNaN(numeric)) {
        setCurrentPrice(numeric);
        if (product?.id) {
          updateProduct(product.id, { price: numeric });
        }
      }
    }
  }, [remoteSession?.currentPrice, product?.id, updateProduct]);

  // 일반 메시지 전송 핸들러
  const handleSendMessage = (e) => {
    e.preventDefault(); // form 기본 제출 동작 방지
    if (newMessage.trim() === '' || !productId) return; // 빈 메시지 전송 방지
    
    // WebSocket 연결 상태 확인
    const ws = wsRef.current;
    if (!ws) {
      console.error('WebSocket is not initialized');
      alert('채팅 연결이 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    
    if (ws.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket is connecting, waiting...');
      // 연결 중이면 잠시 대기 후 재시도
      setTimeout(() => handleSendMessage(e), 500);
      return;
    }
    
    if (ws.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'TALK',
        content: newMessage,
        productId: productId
      };
      try {
        ws.send(JSON.stringify(messageData));
    setNewMessage(''); // 입력창 비우기
        console.log('Message sent via WebSocket:', messageData);
        window.dispatchEvent(new CustomEvent('chat:new-message', {
          detail: {
            productId,
            content: messageData.content,
          }
        }));
      } catch (error) {
        console.error('Failed to send message:', error);
        alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
      }
    } else {
      console.error('WebSocket is not connected. State:', ws.readyState);
      alert('채팅 연결이 끊어졌습니다. 페이지를 새로고침해주세요.');
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files && event.target.files[0];
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify('이미지 용량은 5MB 이하여야 합니다.');
      return;
    }
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      notify('채팅 서버와 연결되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (!dataUrl || typeof dataUrl !== 'string') {
        notify('이미지를 불러오지 못했습니다.');
        setIsUploadingImage(false);
        return;
      }

      const payload = {
        kind: 'IMAGE',
        name: file.name,
        size: file.size,
        mime: file.type,
        dataUrl,
        source: fileCaptureMode,
        caption: '',
        createdAt: new Date().toISOString(),
      };

      const messageData = {
        type: 'TALK',
        content: JSON.stringify(payload),
        productId,
      };

      try {
        wsRef.current.send(JSON.stringify(messageData));
        window.dispatchEvent(new CustomEvent('chat:new-message', {
          detail: {
            productId,
            content: messageData.content,
          },
        }));
        notify('이미지를 전송했습니다.');
      } catch (err) {
        console.error('이미지 메시지 전송 실패:', err);
        notify('이미지 전송에 실패했습니다.');
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.onerror = () => {
      notify('이미지 파일을 읽는 중 오류가 발생했습니다.');
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // + 버튼 기능 선택 핸들러
  const handleFeatureSelect = (feature) => {
    switch (feature) {
      case 'image':
        setFileCaptureMode('any');
        setTimeout(() => fileInputRef.current?.click(), 0);
        break;
      case 'schedule':
        if (!partnerUserId) {
          notify('상대방 시간표 정보를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.');
          return;
        }
        setIsScheduleModalOpen(true);
        break;
      case 'price-adjust':
        if (!isSellerView) {
          notify('판매자만 가격을 조정할 수 있습니다.');
          return;
        }
        setIsPriceModalOpen(true);
        break;
      case 'remote-trade':
        handleRemoteTradeAction();
        break;
      default:
        notify('해당 기능은 준비 중입니다.');
    }
  };

  // 거래 일정 선택 완료 핸들러
  const handleScheduleSelect = (schedule) => {
    // 선택된 일정 정보를 포함하는 새 메시지 객체 생성
    const newScheduleMessage = {
      id: Date.now(),
      sender: 'me',
      type: 'trade_schedule', // 메시지 타입을 'trade_schedule'로 지정
      status: 'pending', // 초기 상태는 '제안 중'
      location: '중앙도서관', // 임시 장소 (실제로는 선택 가능하게)
      time: `${schedule.day}요일 ${schedule.time}`, // 모달에서 전달받은 시간 정보
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    setMessages(prev => [...prev, newScheduleMessage]); // 메시지 목록에 추가
    setIsScheduleModalOpen(false); // 일정 추천 모달 닫기
  };

  // 가격 조정 완료 핸들러
  const handlePriceAdjust = (newPrice) => {
    if (product) {
      // 1. GlobalContext 상태 업데이트 (updateProduct 함수 호출)
      updateProduct(product.id, { price: newPrice });
      // 2. 채팅방 내 현재 가격 상태(currentPrice) 업데이트
      setCurrentPrice(newPrice);
      // 3. 시스템 메시지 추가하여 가격 변경 알림
      addSystemMessage(`판매자가 가격을 ${newPrice.toLocaleString('ko-KR')}원으로 변경했습니다.`);
    }
    setIsPriceModalOpen(false); // 가격 조정 모달 닫기
  };

  // --- 메시지 타입별 렌더링 함수 ---

  // 일반 텍스트 메시지 렌더링
  const renderTextMessage = (msg) => {
    // 내가 보낸 메시지인지 확인 (sender와 user.id 모두 확인)
    const msgUserId = msg.user?.id ? Number(msg.user.id) : null;
    const currentUserId = currentUser?.id ? Number(currentUser.id) : null;
    const isMine = msg.sender === 'me' || (msgUserId !== null && currentUserId !== null && msgUserId === currentUserId);
    
    // 상대방이 보낸 메시지 중 읽지 않은 것만 안읽음 표시
    // readBy 배열에 현재 사용자가 있으면 읽은 것으로 간주
    let showUnread = false;
    if (!isMine) {
      // 상대방이 보낸 메시지인 경우
      // readBy 배열에 현재 사용자가 없으면 읽지 않은 것으로 표시
      const isReadByMe = msg.readBy && Array.isArray(msg.readBy) && 
        msg.readBy.some(r => {
          const rId = r?.id ? Number(r.id) : null;
          return rId !== null && currentUserId !== null && rId === currentUserId;
        });
      showUnread = !isReadByMe;
    }
    
    return (
      <div key={msg.id} className={`message-row ${isMine ? 'mine' : 'partner'}`}>
        {/* 내 메시지일 경우 왼쪽에 시간 표시 (안읽음 표시 제거) */}
        {isMine && (
          <div className="message-meta">
            <span>{msg.timestamp}</span> {/* 시간 표시만 */}
          </div>
        )}
        {/* 메시지 버블 */}
        <div className={`message-bubble ${isMine ? 'mine' : 'partner'}`}>
          {msg.text} {/* 메시지 내용 */}
        </div>
        {/* 상대방 메시지일 경우 오른쪽에 시간 표시 */}
        {!isMine && (
          <div className="message-meta">
            {showUnread && <span className="message-read-status">1</span>} {/* 상대방 메시지 중 읽지 않은 것만 표시 */}
            <span>{msg.timestamp}</span>
          </div>
        )}
      </div>
    );
  };

  const renderImageMessage = (msg) => {
    const msgUserId = msg.user?.id ? Number(msg.user.id) : null;
    const currentUserId = currentUser?.id ? Number(currentUser.id) : null;
    const isMine = msg.sender === 'me' || (msgUserId !== null && currentUserId !== null && msgUserId === currentUserId);

    let showUnread = false;
    if (!isMine) {
      const isReadByMe = msg.readBy && Array.isArray(msg.readBy) &&
        msg.readBy.some(r => {
          const rId = r?.id ? Number(r.id) : null;
          return rId !== null && currentUserId !== null && rId === currentUserId;
        });
      showUnread = !isReadByMe;
    }

    return (
      <div key={msg.id} className={`message-row ${isMine ? 'mine' : 'partner'}`}>
        {isMine && (
          <div className="message-meta">
            <span>{msg.timestamp}</span>
          </div>
        )}
        <div className={`message-bubble image-bubble ${isMine ? 'mine' : 'partner'}`}>
          {msg.imageUrl && (
            <img
              src={msg.imageUrl}
              alt={msg.imageMeta?.name || '보낸 이미지'}
              className="chat-image"
            />
          )}
          {msg.text && <p className="image-caption">{msg.text}</p>}
        </div>
        {!isMine && (
          <div className="message-meta">
            {showUnread && <span className="message-read-status">1</span>}
            <span>{msg.timestamp}</span>
          </div>
        )}
      </div>
    );
  };

  // 거래 일정 메시지 렌더링
  const renderTradeScheduleMessage = (schedule) => {
     const isMine = schedule.sender === 'me' || schedule.sender === MY_USER_ID;
     const isPending = schedule.status === 'pending';
     const isAccepted = schedule.status === 'accepted';
     const isRejected = schedule.status === 'rejected';

     return (
       <div key={schedule.id} className={`message-row ${isMine ? 'mine' : 'partner'}`}>
         {isMine && (
           <div className="message-meta">
             {/* 자신이 보낸 메시지는 안읽음 표시하지 않음 */}
             <span>{schedule.timestamp}</span>
           </div>
         )}
         <div className={`message-bubble trade-schedule ${isMine ? 'mine' : 'partner'}`}>
           <div className="title">거래 일정 {isPending ? '제안' : (isAccepted ? '확정' : '거절')}</div>
           <div className="details">
             <p><strong>장소:</strong> {schedule.location}</p>
             <p><strong>시간:</strong> {schedule.time}</p>
           </div>
           {/* 상태에 따른 버튼 렌더링 */}
           {isPending && !isMine && ( // 상대방 제안 + 대기 중
             <div className="buttons">
               <button className="reject-button" onClick={() => alert('거절 기능')}>거절</button>
               <button className="accept-button" onClick={() => alert('수락 기능')}>수락</button>
             </div>
           )}
           {isPending && isMine && ( // 내 제안 + 대기 중
             <div className="buttons">
               <button className="default-button" disabled>상대방 응답 대기중</button>
             </div>
           )}
            {isAccepted && ( // 확정됨
             <div className="buttons">
               <button className="accept-button" disabled>거래 확정됨</button>
             </div>
           )}
           {isRejected && ( // 거절됨
             <div className="buttons">
               <button className="reject-button" disabled>거래 거절됨</button>
             </div>
           )}
         </div>
         {!isMine && (
           <div className="message-meta">
             <span>{schedule.timestamp}</span>
           </div>
         )}
       </div>
     );
  };

  const renderPriceProposalMessage = () => {
    const proposal = remoteSession?.priceProposal;
    if (!proposal) return null;

    const status = proposal.status;
    const isPending = status === 'PENDING';
    const isAccepted = status === 'ACCEPTED';
    const isRejected = status === 'REJECTED';
    const proposedByMe =
      proposal.proposedByUserId !== null &&
      proposal.proposedByUserId !== undefined &&
      currentUserId !== null &&
      Number(proposal.proposedByUserId) === currentUserId;

    const priceValue = proposal.price !== null && proposal.price !== undefined ? Number(proposal.price) : null;
    const priceLabel =
      priceValue !== null && !Number.isNaN(priceValue)
        ? `${priceValue.toLocaleString('ko-KR')}원`
        : '금액 정보 없음';

    const proposedAt = proposal.proposedAt
      ? new Date(proposal.proposedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null;

    const respondedAt = proposal.respondedAt
      ? new Date(proposal.respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null;

    return (
      <div key="price-proposal" className={`message-row ${proposedByMe ? 'mine' : 'partner'}`}>
        {proposedByMe && (
          <div className="message-meta">
            {proposedAt && <span>{proposedAt}</span>}
          </div>
        )}
        <div className={`message-bubble price-proposal ${proposedByMe ? 'mine' : 'partner'}`}>
          <div className="proposal-header">
            <span className="proposal-title">가격 제안</span>
            <span className={`proposal-status proposal-${status?.toLowerCase()}`}>{priceLabel}</span>
          </div>
          <div className="proposal-body">
            <p className="proposal-text">
              {proposedByMe
                ? '구매자의 응답을 기다립니다.'
                : `${proposal.proposedByNickname || '판매자'}님이 가격을 조정했습니다.`}
            </p>
            {isAccepted && (
              <p className="proposal-result">가격 제안이 수락되었습니다. 새로운 거래 금액으로 진행됩니다.</p>
            )}
            {isRejected && (
              <p className="proposal-result rejected">가격 제안이 거절되었습니다.</p>
            )}
            {respondedAt && (
              <p className="proposal-timestamp">응답 시간: {respondedAt}</p>
            )}
          </div>
          {isPending && !proposedByMe && isBuyerView && (
            <div className="proposal-actions">
              <button
                type="button"
                className="proposal-button reject"
                onClick={() => handlePriceProposalDecision(false)}
                disabled={remoteSessionLoading}
              >
                거절
              </button>
              <button
                type="button"
                className="proposal-button accept"
                onClick={() => handlePriceProposalDecision(true)}
                disabled={remoteSessionLoading}
              >
                수락
              </button>
            </div>
          )}
          {isPending && proposedByMe && (
            <div className="proposal-await">상대방 응답을 기다리는 중입니다.</div>
          )}
        </div>
        {!proposedByMe && (
          <div className="message-meta">
            {proposedAt && <span>{proposedAt}</span>}
          </div>
        )}
      </div>
    );
  };

  // 시스템 메시지 렌더링 (백엔드 알림 메시지 파싱)
  const renderSystemMessage = (msg) => {
    // 백엔드에서 온 JSON 알림 메시지 파싱
    let notificationData = null;
    if (msg.content) {
      try {
        notificationData = JSON.parse(msg.content);
      } catch (e) {
        // JSON이 아니면 일반 텍스트로 처리
      }
    }

    // 알림 타입별 렌더링
    if (notificationData && notificationData.type) {
      const { type, message, sellerCode, buyerCode, photoUrl, productName } = notificationData;
      
      if (type === 'PAYMENT_STARTED' && sellerCode) {
        // 결제 완료: 판매자에게 보관함 QR 전송
        const shouldDisplay = isSellerView;
        if (!shouldDisplay) return null;
        return (
          <div key={msg.id} className="message-row-system">
            <div className="notification-bubble">
              <p>{message}</p>
              <QRCodeDisplay qrCode={sellerCode} title="판매자용 보관함 QR 코드" />
              <p className="qr-instruction">이 QR 코드를 키오스크에서 스캔하여 물품을 보관해주세요.</p>
            </div>
          </div>
        );
      }
      
      if (type === 'DEPOSIT_CONFIRMED' && buyerCode) {
        // 보관 완료: 구매자에게 수령 QR + 사진 전송
        const shouldDisplay = !isSellerView;
        if (!shouldDisplay) return null;
        return (
          <div key={msg.id} className="message-row-system">
            <div className="notification-bubble">
              <p>{message}</p>
              {photoUrl && (
                <img src={`${API_BASE_URL}${photoUrl}`} alt="보관함 사진" style={{maxWidth: '100%', margin: '10px 0', borderRadius: '8px'}} />
              )}
              <QRCodeDisplay qrCode={buyerCode} title="구매자용 수령 QR 코드" />
              <p className="qr-instruction">이 QR 코드를 키오스크에서 스캔하여 물품을 수령하세요.</p>
            </div>
          </div>
        );
      }
      
      if (type === 'PICKUP_COMPLETED') {
        // 수령 완료: 판매자에게 정산 완료 알림
        const shouldDisplay = isSellerView;
        if (!shouldDisplay) return null;
        return (
          <div key={msg.id} className="message-row-system">
            <div className="notification-bubble">
              <p>{message}</p>
            </div>
          </div>
        );
      }
    }

    // 일반 시스템 메시지 (JSON이 아닌 경우)
    return (
    <div key={msg.id} className="message-row-system">
        <span>{msg.content || msg.text}</span>
    </div>
  );
  };

  // QR 코드 메시지 렌더링
  const renderQrMessage = (msg) => {
    // 이 QR 코드를 현재 사용자가 봐야 하는지 결정
    // 판매자 QR은 판매자에게만, 구매자 QR은 구매자에게만 보이도록
    const shouldDisplay = (isSellerView && msg.for === 'seller') || (!isSellerView && msg.for === 'buyer');

    // 내가 봐야 할 QR이 아니면 렌더링하지 않음
    if (!shouldDisplay) return null;

    // 내가 보낸 것처럼 오른쪽에 표시할지 (항상 시스템 발송이므로 isMine은 false)
    const isMine = false; // 시스템 메시지는 항상 상대방 버블처럼 왼쪽에 표시 (선택 사항)

    return (
      <div key={msg.id} className={`message-row ${isMine ? 'mine' : 'partner'}`}>
        {/* QR 메시지는 시간/읽음 상태 표시 생략 가능 */}
        <div className={`message-bubble qr-code ${isMine ? 'mine' : 'partner'}`}>
          <div className="qr-title">{msg.text}</div> {/* QR 코드 제목 */}
          <QRCodeDisplay qrCode={msg.qrCode} title={msg.text} />
          <p className="qr-instruction">이 QR 코드를 키오스크에서 스캔해주세요.</p> {/* 안내 문구 */}
        </div>
        {!isMine && (
           <div className="message-meta">
             <span>{msg.timestamp}</span> {/* 시간 표시 */}
           </div>
         )}
      </div>
    );
  };

  // QR 코드 표시 컴포넌트
  const QRCodeDisplay = ({ qrCode, title }) => {
    if (!qrCode) return null;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '15px 0' }}>
        {title && <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>{title}</p>}
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#fff', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <QRCodeSVG value={qrCode} size={200} level="M" />
        </div>
        <p style={{ marginTop: '10px', fontSize: '0.85em', color: '#666', wordBreak: 'break-all' }}>
          코드: {qrCode}
        </p>
      </div>
    );
  };


  // 로딩 상태 표시
  if (productLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>채팅방 정보를 불러오는 중...</div>
        <div style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
          채팅방 ID: {chatId}, 상품 ID: {productId || '없음'}
        </div>
      </div>
    );
  }

  // 상품 정보가 없고 에러가 있으면 에러 표시
  if (!product && productError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>{productError}</div>
        <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
          채팅방 ID: {chatId}, 상품 ID: {productId || '없음'}
        </div>
        <button onClick={() => navigate('/chat')} style={{ padding: '10px 20px', marginTop: '10px' }}>
          채팅 목록으로 돌아가기
        </button>
      </div>
    );
  }

  // 상품 정보가 없으면 기본 정보로 진행 (최소한의 정보라도 표시)
  if (!product) {
    console.warn('ChatRoomPage: Product is null, using default values');
    // 기본 상품 정보 생성 (최소한의 정보라도 표시)
    const defaultProduct = {
      id: productId,
      sellerNickname: roomInfo?.partner?.nickname || 'Unknown',
      sellerHasTimetable: false,
      title: '상품 정보 없음',
      nickname: roomInfo?.partner?.nickname || 'Unknown',
      description: '',
      price: 0,
      status: 'selling',
      category: '기타',
      createdAt: new Date().toISOString(),
      viewCount: 0,
      imageUrl: '',
    };
    setProduct(defaultProduct);
    setCurrentPrice(0);
    // 이렇게 하면 무한 렌더링 루프가 발생할 수 있으므로, 조건부 렌더링으로 처리
  }

  // 상품이 여전히 null이면 로딩 표시
  if (!product) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>채팅방 정보를 불러오는 중...</div>
      </div>
    );
  }

  const tradeActionConfig = (() => {
    if (!isRemoteTrade) {
      return {
        label: '비대면 거래 아님',
        disabled: true,
        tooltip: '비대면 거래 상품에서만 이용 가능합니다.',
      };
    }
    if (isSellerView) {
      return {
        label: sellerButtonLabel,
        disabled: sellerButtonDisabled,
        tooltip: tradePhase === 'COMPLETED' ? '거래가 이미 완료되었습니다.' : undefined,
      };
    }
    if (isBuyerView) {
      let tooltip;
      if (tradePhase === 'IDLE' || tradePhase === 'SELLER_QR') {
        tooltip = '판매자가 물품을 등록하면 이용할 수 있습니다.';
      } else if (tradePhase === 'COMPLETED') {
        tooltip = '거래가 이미 완료되었습니다.';
      }
      return {
        label: buyerButtonLabel,
        disabled: buyerButtonDisabled,
        tooltip,
      };
    }
    return {
      label: '거래 정보 없음',
      disabled: true,
      tooltip: '판매자 또는 구매자만 이용할 수 있습니다.',
    };
  })();

  const priceAdjustDisabled = !isSellerView || tradePhase === 'COMPLETED';
  const priceAdjustTooltip = !isSellerView
    ? '판매자만 가격을 조정할 수 있습니다.'
    : tradePhase === 'COMPLETED'
    ? '완료된 거래에서는 가격을 변경할 수 없습니다.'
    : undefined;

  // --- 메인 렌더링 ---
  return (
    <div className="chat-room-page">
      {/* --- 상단 헤더 --- */}
      <header className="chat-room-header">
        <button onClick={() => navigate('/chat')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="chat-room-partner-name">{partnerInfo?.nickname || product.sellerNickname || 'Unknown'}</h2>
        <span className={`chat-connection-status status-${wsStatus}`}>
          {wsStatus === 'idle' && '대기'}
          {wsStatus === 'connected' && '연결됨'}
          {wsStatus === 'connecting' && '연결 중...'}
          {wsStatus === 'closed' && '연결 종료'}
          {wsStatus === 'error' && '오류'}
        </span>
      </header>

      {/* --- 상단 거래 상품 정보 헤더 --- */}
      <ProductTradeHeader
        product={product} // 현재 상품 정보 전달
        currentPrice={currentPrice} // 조정될 수 있는 현재 가격 전달
        onPriceAdjustClick={() => setIsPriceModalOpen(true)} // 가격 조정 모달 열기 함수 전달
        isSellerView={isSellerView} // 현재 사용자가 판매자인지 여부 전달
      />

      {isRemoteTrade && (
        <div className="remote-trade-status">
          <div className="remote-trade-info">
            <span className={`phase-badge phase-${tradePhase.toLowerCase()}`}>{remotePhaseLabel}</span>
            <p className="phase-text">{remotePhaseDescription}</p>
            {remoteSession?.lockerNumber && tradePhase !== 'IDLE' && (
              <p className="phase-subtext">배정된 캐비닛: {remoteSession.lockerNumber}번</p>
            )}
            {remoteSession?.buyerEscrowAmount && tradePhase === 'BUYER_QR' && (
              <p className="phase-subtext">
                결제 금액: {Number(remoteSession.buyerEscrowAmount).toLocaleString('ko-KR')}원
              </p>
            )}
            {remoteSessionError && (
              <p className="phase-subtext phase-error">{remoteSessionError}</p>
            )}
            {remoteSessionLoading && <p className="phase-loading">거래 상태를 동기화하는 중...</p>}
          </div>
          <div className="remote-trade-actions">
            {isSellerView && (
              <button
                type="button"
                className="remote-trade-button"
                onClick={handleSellerTradeAction}
                disabled={sellerButtonDisabled}
              >
                {sellerButtonLabel}
              </button>
            )}
            {isBuyerView && (
              <button
                type="button"
                className="remote-trade-button"
                onClick={handleBuyerTradeAction}
                disabled={buyerButtonDisabled}
              >
                {buyerButtonLabel}
              </button>
            )}
            <button
              type="button"
              className="remote-guide-button"
              onClick={() => setShowGuideModal(true)}
              title="비대면 거래 이용 안내"
            >
              ?
            </button>
          </div>
        </div>
      )}

      {/* --- 메시지 목록 --- */}
      <main className="message-list">
        {messages.map(msg => {
          // 메시지 타입에 따라 적절한 렌더링 함수 호출
          switch (msg.type) {
            case 'trade_schedule':
              return renderTradeScheduleMessage(msg);
            case 'system':
              return renderSystemMessage(msg);
            case 'system_qr':
              return renderQrMessage(msg);
            case 'image':
              return renderImageMessage(msg);
            default:
              return renderTextMessage(msg);
          }
        })}
        {renderPriceProposalMessage()}
        {/* 스크롤 위치 조정을 위한 빈 div */}
        <div ref={messageEndRef} />
      </main>

      {/* --- 하단 메시지 입력창 --- */}
      <div className="chat-input-area">
        <button className="chat-plus-button" onClick={() => setIsFeaturesModalOpen(true)}>+</button>
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <textarea
            className="chat-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            rows={1} // 기본 한 줄
            // 엔터키로 전송하는 기능 추가 가능 (onKeyDown 핸들러)
          />
          <button type="submit" className="chat-send-button">전송</button>
        </form>
      </div>
      {isUploadingImage && (
        <div className="chat-upload-indicator">이미지 전송 중...</div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={fileCaptureMode === 'camera' ? 'environment' : undefined}
        style={{ display: 'none' }}
        onChange={handleImageSelect}
      />

      {/* --- 모달 렌더링 영역 --- */}
      {/* 기능 선택 모달 */}
      {isFeaturesModalOpen && (
        <ChatFeaturesModal
          onClose={() => setIsFeaturesModalOpen(false)}
          onFeatureSelect={handleFeatureSelect}
          sellerHasTimetable={product.sellerHasTimetable ?? true}
          tradeAction={tradeActionConfig}
          priceAdjustDisabled={priceAdjustDisabled}
          priceAdjustTooltip={priceAdjustTooltip}
        />
      )}
      {/* 일정 추천 모달 */}
      {isScheduleModalOpen && (
        <TradeScheduleRecommendModal
          partnerNickname={partnerInfo?.nickname || product.sellerNickname || '상대방'}
          partnerUserId={partnerUserId}
          onClose={() => setIsScheduleModalOpen(false)}
          onSendRecommendation={handleScheduleRecommendationSend}
        />
      )}
      {/* 가격 조정 모달 (판매자 뷰일 때만) */}
      {isPriceModalOpen && isSellerView && (
        <PriceAdjustModal
          currentPrice={currentPrice} // 현재 가격 전달
          onClose={() => setIsPriceModalOpen(false)}
          onSave={handlePriceAdjustSave} // 저장 시 호출될 함수 전달
        />
      )}
      {isSellerModalOpen && (
        <SellerDepositModal
          open={isSellerModalOpen}
          step={sellerModalStep}
          onClose={() => {
            setIsSellerModalOpen(false);
            setSellerModalStep(0);
          }}
          onStepChange={setSellerModalStep}
          onComplete={handleSellerComplete}
          session={remoteSession}
          loading={remoteSessionLoading}
        />
      )}
      {isBuyerModalOpen && (
        <BuyerPickupModal
          open={isBuyerModalOpen}
          step={buyerModalStep}
          onClose={() => {
            setIsBuyerModalOpen(false);
            setBuyerModalStep(0);
          }}
          onStepChange={setBuyerModalStep}
          onPay={handleBuyerPayment}
          onComplete={handleBuyerComplete}
          session={remoteSession}
          walletBalance={getCurrentWalletBalance()}
          onRecharge={rechargeCurrentUser}
          loading={remoteSessionLoading}
        />
      )}
      {showGuideModal && <RemoteGuideStepperModal onClose={() => setShowGuideModal(false)} />}
    </div>
  );
}

export default ChatRoomPage;