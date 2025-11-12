// src/components/TradeScheduleRecommendModal.jsx
import React, { useEffect, useState, useCallback } from 'react';
import './TradeScheduleRecommendModal.css';
import { getTimetableRecommendation } from '../api/timetableApi';

function TradeScheduleRecommendModal({
  partnerNickname,
  partnerUserId,
  onClose,
  onSendRecommendation,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    if (!partnerUserId) {
      setError('상대방 정보를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await getTimetableRecommendation(partnerUserId);
      setMessage(result.message || '거래 가능한 시간대를 추천합니다.');
      setRecommendations(result.top3Recommendations || []);
      setSelected(result.top3Recommendations?.[0] || null);
    } catch (err) {
      setError(err.message || '추천 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [partnerUserId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleConfirm = () => {
    if (!recommendations.length) {
      onClose();
      return;
    }
    onSendRecommendation({
      message,
      recommendations,
      selected: selected || recommendations[0],
    });
    onClose();
  };

  return (
    <div className="recommend-modal-backdrop">
      <div className="recommend-modal-content">
        <h3>거래 일정 추천</h3>
        <p className="recommend-description">
          {partnerNickname ? `${partnerNickname}님과 가능한 시간을 찾아봤어요.` : '공통 비어있는 시간을 찾고 있습니다.'}
        </p>

        {loading && <p className="recommend-loading">시간표를 분석하는 중입니다...</p>}
        {!loading && error && <p className="recommend-error" role="alert">{error}</p>}

        {!loading && !error && (
          <>
            <p className="recommend-message">{message}</p>
            <div className="recommend-list">
              {recommendations.length === 0 && <p className="recommend-empty">공통으로 비어있는 시간이 없습니다.</p>}
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`recommend-item ${selected === rec ? 'selected' : ''}`}
                  onClick={() => setSelected(rec)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelected(rec); }}
                >
                  {rec}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="recommend-actions">
          <button className="cancel-button" onClick={onClose}>취소</button>
          <button className="other-button" onClick={fetchRecommendations} disabled={loading}>
            다시 추천
          </button>
          <button className="confirm-button" onClick={handleConfirm} disabled={loading || !!error}>
            채팅에 공유
          </button>
        </div>
      </div>
    </div>
  );
}

export default TradeScheduleRecommendModal;