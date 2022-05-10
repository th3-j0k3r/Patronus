import { AnimatePresence, motion } from 'framer-motion';
import type { FC, ReactNode } from 'react';

const FadeTransition: FC<{ children: ReactNode; durationInSec?: number }> = ({
  children,
  durationInSec = 0.7,
}) => {
  return (
    <AnimatePresence exitBeforeEnter>
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: durationInSec }}
        exit={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default FadeTransition;
