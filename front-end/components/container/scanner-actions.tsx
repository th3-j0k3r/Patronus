import type { FC } from 'react';
import { useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import {
  markAsFalsePositive,
  markAsResolved,
  raiseJiraTicket,
} from '../helpers/mark-scan';

interface ScannerActionsProps {
  isResolved: boolean;
  isFalsePositive: boolean;
  id: string;
  isJiraRaised: boolean;
}

const ScannerActions: FC<ScannerActionsProps> = ({
  isResolved,
  id,
  isFalsePositive,
  isJiraRaised,
}) => {
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [isSuppressing, setIsSuppressing] = useState<boolean>(false);
  const [resolveMarked, setResolveMarked] = useState<boolean>(false);
  const [suppressMarked, setSuppressMarked] = useState<boolean>(false);
  const [raisingTicket, setIsRaisingTicket] = useState<boolean>(false);
  const [raised, setIsRaised] = useState<boolean>(false);

  return (
    <div className="flex lg:justify-end  items-center">
      <button
        disabled={
          isFalsePositive ||
          isResolved ||
          isResolving ||
          suppressMarked ||
          isSuppressing ||
          resolveMarked ||
          isJiraRaised ||
          raised
        }
        onClick={async () => {
          setIsResolving(true);
          const { isResolved } = await markAsResolved([id]);
          setIsResolving(false);
          if (isResolved) {
            setResolveMarked(true);
          }
        }}
        className="
           border border-opacity-30 whitespace-nowrap
           mr-2 p-1 px-3
           rounded-md 
           bg-green-600
           hover:bg-green-800 flex items-center
          "
      >
        {isResolving ? <ImSpinner2 className="animate-spin mr-2" /> : ''}
        {isResolving
          ? 'Please wait'
          : isResolved || resolveMarked
          ? 'Resolved'
          : 'Resolve'}
      </button>
      <button
        onClick={async () => {
          setIsSuppressing(true);
          const { isFalsePositive } = await markAsFalsePositive([id]);
          if (isFalsePositive) {
            setSuppressMarked(true);
          }
          setIsSuppressing(false);
        }}
        disabled={
          isFalsePositive ||
          isResolved ||
          isResolving ||
          suppressMarked ||
          isSuppressing ||
          resolveMarked ||
          isJiraRaised ||
          raised
        }
        className="
           border border-opacity-30 whitespace-nowrap
           mx-2 p-1 px-3
           rounded-md 
            bg-red-600
           hover:bg-red-800 flex items-center
          "
      >
        {isSuppressing ? <ImSpinner2 className="animate-spin mr-2" /> : ''}
        {isSuppressing
          ? 'Please wait'
          : isFalsePositive || suppressMarked
          ? 'Marked as FP'
          : 'Mark as FP'}
      </button>
      <button
        onClick={async () => {
          setIsRaisingTicket(true);
          const { isFalsePositive } = await raiseJiraTicket(id);
          if (isFalsePositive) {
            setIsRaised(true);
          }
          setIsRaisingTicket(false);
        }}
        disabled={
          isFalsePositive ||
          isResolved ||
          isResolving ||
          suppressMarked ||
          isSuppressing ||
          resolveMarked ||
          isJiraRaised ||
          raised
        }
        className="
           border border-opacity-30 whitespace-nowrap
           mx-2 p-1 px-3
           rounded-md 
             bg-blue-600
           hover:bg-blue-800 flex items-center
          "
      >
        {raisingTicket ? <ImSpinner2 className="animate-spin mr-2" /> : ''}
        {raisingTicket
          ? 'Please wait'
          : raised || isJiraRaised
          ? 'Jira Ticket Raised'
          : 'Raise Jira'}
      </button>
    </div>
  );
};

export default ScannerActions;
