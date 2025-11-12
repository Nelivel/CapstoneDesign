// src/components/GlobalNotifier.jsx
import React, { useEffect, useState, useRef } from 'react';
import './GlobalNotifier.css';

const DISPLAY_DURATION = 2600;
const HIDE_DURATION = 300;

function GlobalNotifier() {
  const [queue, setQueue] = useState([]);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(null);
  const [isHiding, setIsHiding] = useState(false);
  const hideTimerRef = useRef(null);
  const removeTimerRef = useRef(null);

  useEffect(() => {
    const handleNotify = (event) => {
      const message = event.detail?.message;
      if (!message) return;
      setQueue((prev) => [...prev, { id: Date.now(), message }]);
    };

    window.addEventListener('app:notify', handleNotify);
    return () => {
      window.removeEventListener('app:notify', handleNotify);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(hideTimerRef.current);
      clearTimeout(removeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (visible || queue.length === 0) return;
    const next = queue[0];
    setCurrent(next);
    setVisible(true);
    setIsHiding(false);

    clearTimeout(hideTimerRef.current);
    clearTimeout(removeTimerRef.current);

    hideTimerRef.current = setTimeout(() => {
      setIsHiding(true);
    }, DISPLAY_DURATION);

    removeTimerRef.current = setTimeout(() => {
      setVisible(false);
      setQueue((prev) => prev.slice(1));
      setCurrent(null);
      setIsHiding(false);
    }, DISPLAY_DURATION + HIDE_DURATION);
  }, [queue, visible]);

  const handleClose = () => {
    clearTimeout(hideTimerRef.current);
    clearTimeout(removeTimerRef.current);
    setIsHiding(true);
    setTimeout(() => {
      setVisible(false);
      setQueue((prev) => prev.slice(1));
      setCurrent(null);
      setIsHiding(false);
    }, HIDE_DURATION);
  };

  if (!visible || !current) return null;

  return (
    <div className="global-notifier">
      <div className={`notifier-card ${isHiding ? 'hiding' : ''}`}>
        <span className="notifier-message">{current.message}</span>
        <button className="notifier-close" onClick={handleClose}>×</button>
      </div>
    </div>
  );
}

export default GlobalNotifier;
