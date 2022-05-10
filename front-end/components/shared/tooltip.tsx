import type { FC } from 'react';

const ToolTipWrapper: FC<{ message: string }> = ({ children, message }) => {
  return (
    <div className="tool-tip relative " data-tooltip={message}>
      <div>{children}</div>
    </div>
  );
};

export default ToolTipWrapper;
