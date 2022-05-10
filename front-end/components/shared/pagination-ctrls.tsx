import { useRouter } from 'next/router';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useEffect } from 'react';

interface PaginationControlsProps {
  hasPrev?: boolean;
  hasNext?: boolean;
  setPageNumber: Dispatch<SetStateAction<number>>;
  pageNumber: number;
}

const PaginationControls: FC<PaginationControlsProps> = ({
  hasPrev = false,
  hasNext = false,
  setPageNumber,
  pageNumber,
}) => {
  const { push, pathname, query } = useRouter();

  useEffect(() => {
    let isCancelled = false;

    if (!isCancelled) {
      try {
        if (query?.page) {
          const pageNum = parseInt(query?.page as string);

          if (pageNum < 1) {
            throw '';
          }

          setPageNumber(pageNum);
        } else {
          throw '';
        }
      } catch (e) {
        setPageNumber(1);
      }
    }

    return () => {
      isCancelled = false;
    };
  }, [query, setPageNumber]);

  function updatePageURL(pageNumber: number) {
    push({ pathname: pathname, query: { page: pageNumber } }, undefined, {
      shallow: true,
      scroll: true,
    });
  }

  return (
    <div className="m-auto flex mt-5 mb-3">
      <button
        disabled={!hasPrev}
        onClick={() => {
          updatePageURL(pageNumber - 1);
        }}
        className="p-2 text-white bg-gray-50 hover:bg-white transform transition-all hover:text-black bg-opacity-60 mx-2 px-6 rounded shadow-lg"
      >
        Prev
      </button>
      <button
        disabled={!hasNext}
        onClick={() => {
          updatePageURL(pageNumber + 1);
        }}
        className="p-2 text-white bg-gray-50 hover:bg-white transform transition-all hover:text-black bg-opacity-60 mx-2 px-6 rounded shadow-lg"
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
