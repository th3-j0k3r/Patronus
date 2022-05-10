import { motion } from 'framer-motion';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import ScaleUpAnimationWrapper from '../shared/animation/scale-up-animation-wrapper';
import ToolTipWrapper from '../shared/tooltip';

interface ReportCardProps {
  allowAnimation?: boolean;
  title: string;
  subTitle: string;
  count: number;
  topMetrics: {
    count: number;
    title: string;
    textColor?: string;
    countColor?: string;
  };
  bottomMetrics: {
    count: number;
    title: string;
    textColor?: string;
    countColor?: string;
  };
  icon: ReactNode;
  cardInfo: string;
  countColor?: string;
}

export const ReportCard: FC<ReportCardProps> = ({
  allowAnimation = true,
  count,
  title,
  subTitle,
  topMetrics,
  bottomMetrics,
  icon,
  cardInfo,
  countColor,
}) => {
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(false);

  return (
    <ScaleUpAnimationWrapper allowAnimation={allowAnimation}>
      <div
        onMouseEnter={() => allowAnimation && setShouldAnimate(true)}
        onMouseLeave={() => allowAnimation && setShouldAnimate(false)}
        className="w-auto bg-surface-md-dark rounded p-3 shadow-2xl text-white h-full"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span>{title}</span>
            <span className="ml-1 cursor-pointer">
              <ToolTipWrapper message={cardInfo}>
                <AiOutlineExclamationCircle />
              </ToolTipWrapper>
            </span>
          </div>
          <motion.span
            animate={shouldAnimate ? { rotate: 360 } : {}}
            transition={{ duration: 2 }}
            initial={false}
          >
            {icon}
          </motion.span>
        </div>
        {count || topMetrics.count || bottomMetrics.count ? (
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="mt-auto">
              <span className="text-gray-300 text-sm ">{subTitle}</span>
              <span className={`block font-medium text-3xl pt-1 ${countColor}`}>
                {count}
              </span>
            </div>

            <div>
              <span
                className={`block text-right font-semibold ${topMetrics.countColor}`}
              >
                {topMetrics.count}
              </span>
              <span
                className={
                  ' text-sm text-right block ' + topMetrics.textColor || ''
                }
              >
                {topMetrics.title}
              </span>

              <span
                className={`block text-right mt-2 font-semibold ${bottomMetrics.countColor}`}
              >
                {bottomMetrics.count}
              </span>
              <span
                className={
                  '  text-sm text-right block ' + bottomMetrics.textColor || ''
                }
              >
                {bottomMetrics.title}
              </span>
            </div>
          </div>
        ) : (
          <p>No result found</p>
        )}
      </div>
    </ScaleUpAnimationWrapper>
  );
};
