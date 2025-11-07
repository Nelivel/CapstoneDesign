// src/pages/ReputationPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getMe } from '../api/authApi';
import { getReviewsForUser } from '../api/reviewApi';
import './ReputationPage.css';

function ReputationPage() {
  const { navigate } = useNavigation();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
        if (me?.id) {
          const data = await getReviewsForUser(me.id);
          setReviews(data || []);
        }
      } catch (e) {
        console.error('신뢰도 로드 실패:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="reputation-page">
      <header className="reputation-header">
        <button onClick={() => navigate('/mypage')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="reputation-header-title">나의 신뢰도</h2>
      </header>
      <main className="reputation-main">
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <>
            <div className="reputation-summary">
              <div className="rating-circle">
                <span className="rating-value">{avgRating}</span>
                <span className="rating-max">/ 5.0</span>
              </div>
              <p className="review-count">총 {reviews.length}개의 후기</p>
            </div>
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">{review.reviewer?.nickname || '익명'}</span>
                      <span className="review-rating">⭐ {review.rating}</span>
                    </div>
                    {review.comment && (
                      <p className="review-comment">{review.comment}</p>
                    )}
                    <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="no-reviews">아직 받은 후기가 없습니다.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
export default ReputationPage;