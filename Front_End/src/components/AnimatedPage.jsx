// src/components/AnimatedPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';

function AnimatedPage({ children }) {
  const { direction } = useNavigation();

  const variants = {
    forwardInitial: { x: '100%', opacity: 0 },
    forwardAnimate: { x: 0, opacity: 1 },
    forwardExit: { x: '-100%', opacity: 0 },
    backwardInitial: { x: '-100%', opacity: 0 },
    backwardAnimate: { x: 0, opacity: 1 },
    backwardExit: { x: '100%', opacity: 0 },
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      variants={variants}
      initial={direction === 'forward' ? 'forwardInitial' : 'backwardInitial'}
      animate={direction === 'forward' ? 'forwardAnimate' : 'backwardAnimate'}
      exit={direction === 'forward' ? 'forwardExit' : 'backwardExit'}
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedPage;