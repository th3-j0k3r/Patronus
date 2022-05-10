import { motion } from 'framer-motion';
import type { FC } from 'react';
import { useState } from 'react';

const ScaleUpAnimationWrapper: FC<{
  allowAnimation?: boolean;
  amount?: number;
}> = ({ children, allowAnimation = true, amount = 1.02 }) => {
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(false);

  return (
    <motion.div
      onMouseEnter={() => allowAnimation && setShouldAnimate(true)}
      onMouseLeave={() => allowAnimation && setShouldAnimate(false)}
      animate={shouldAnimate ? { scale: amount } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default ScaleUpAnimationWrapper;
