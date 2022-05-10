import type { FC } from 'react';
import { Fragment } from 'react';

const SectionTitle: FC<{ title: string; showDivider?: boolean }> = ({
  title,
  showDivider = false,
}) => {
  return (
    <Fragment>
      <h1 className="text-white mb-3 text-xl font-normal">{title}</h1>
      {showDivider ? <hr className="mb-3" /> : ''}
    </Fragment>
  );
};

export default SectionTitle;
