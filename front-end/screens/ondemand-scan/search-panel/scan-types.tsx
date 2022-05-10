import type { Dispatch, FC, SetStateAction } from 'react';
import { Fragment, useRef, useState } from 'react';
import useHandleClose from '../../../hooks/useHandleClose';
import DropDownResultsWrapper from '../common/drop-down-results-wrapper';

interface ScanTypeProps {
  setSelectedScantype: Dispatch<SetStateAction<string>>;
  selectedScantype: string;
  isDisabled: boolean;
}

const ScanType: FC<ScanTypeProps> = ({
  selectedScantype,
  setSelectedScantype,
  isDisabled,
}) => {
  const [isMutated, setIsMutated] = useState<boolean>(false);

  const inputRef = useRef<HTMLDivElement>(null);

  useHandleClose<HTMLDivElement | null>(() => {
    setIsMutated(false);
  }, inputRef);

  const ResultsBody: FC = () => {
    const data = ['SCA', 'SAST', 'SS', 'All'];

    return (
      <Fragment>
        {data?.map((type) => {
          return (
            <p
              title={type}
              key={type}
              className="px-1 py-1.5 hover:bg-slate-200 hover:text-slate-800 rounded
              cursor-pointer "
              onClick={() => {
                setSelectedScantype(type);
              }}
            >
              {type}
            </p>
          );
        })}
      </Fragment>
    );
  };

  return (
    <div ref={inputRef} className="w-full relative">
      <input
        onClick={() => setIsMutated(true)}
        type="text"
        value={selectedScantype}
        onChange={() => {}}
        name="search-scantype"
        className={`
        ${isMutated ? 'rounded-t-lg' : 'rounded-lg'} 
          p-2 bg-opacity-50 bg-white 
          focus:outline-none
          text-white w-full  placeholder-gray-200`}
        placeholder={'Scan type'}
        autoComplete="off"
        disabled={isDisabled}
        style={{ caretColor: 'transparent' }}
      />
      <DropDownResultsWrapper show={isMutated}>
        <ResultsBody />
      </DropDownResultsWrapper>
    </div>
  );
};

export default ScanType;
