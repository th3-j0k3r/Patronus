import Image from 'next/image';
import type { FC } from 'react';
import { Fragment } from 'react';

const BrandLogo: FC<{ isExpanded: boolean }> = ({ isExpanded }) => {
  return (
    <Fragment>
      <div className="sm:hidden block h-10 w-full">
        <Image
          layout="fixed"
          src={'/favicon.png'}
          width={45}
          height={45}
          alt="..."
        />
      </div>

      <div
        className={`${
          !isExpanded ? 'sm:flex items-center' : 'sm:block'
        } hidden h-10 w-full  ˀ`}
      >
        {!isExpanded ? (
          <Image
            layout="fixed"
            src={'/favicon.png'}
            width={30}
            height={30}
            alt="..."
          />
        ) : (
          <Image
            layout="responsive"
            src={'/logo.png'}
            width={120}
            height={40}
            alt="..."
          />
        )}
      </div>
    </Fragment>
  );
};
export default BrandLogo;
