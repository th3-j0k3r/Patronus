import { AnimatePresence, motion, Variant } from 'framer-motion';
import type { FC, ReactNode } from 'react';

const DropDownResultsWrapper: FC<{ show: boolean; children: ReactNode }> = ({
  show,
  children,
}) => {
  const varients: { initial: Variant; animate: Variant; exit: Variant } = {
    animate: { opacity: 1, height: 'auto' },
    initial: { opacity: 0, height: 0 },
    exit: { opacity: 0, height: 0 },
  };

  if (!show) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={varients}
        initial="initial"
        animate="animate"
        exit="exit"
        className="absolute bg-gray-500 text-gray-50 p-1 w-full rounded-b-lg max-h-64 overflow-y-auto overflow-x-hidden scroll-smooth z-10"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default DropDownResultsWrapper;
