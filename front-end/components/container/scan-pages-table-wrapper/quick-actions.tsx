import type { FC } from 'react';
import { useState } from 'react';
import { AiFillCheckCircle } from 'react-icons/ai';
import { ImCross, ImSpinner2 } from 'react-icons/im';
import { SiJira } from 'react-icons/si';
import {
  markAsFalsePositive,
  markAsResolved,
  raiseJiraTicket,
} from '../../helpers/mark-scan';
import { TableData } from '../../shared/table-elements';

interface QuickActionsProps {
  isResolved: boolean;
  id: string;
  isMarkAsFalse: boolean;
  isTicketRaised: boolean;
}

const QuickActions: FC<QuickActionsProps> = ({
  id,
  isResolved,
  isMarkAsFalse,
  isTicketRaised,
}) => {
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [isSuppressing, setIsSuppressing] = useState<boolean>(false);
  const [raisingTicket, setIsRaisingTicket] = useState<boolean>(false);
  const [remark, setremark] = useState<boolean>(false);

  return (
    <TableData>
      <div className="flex justify-start items-center text-lg">
        <button
          disabled={
            isMarkAsFalse ||
            isResolved ||
            isResolving ||
            remark ||
            isSuppressing ||
            isTicketRaised ||
            raisingTicket
          }
          onClick={async () => {
            setIsResolving(true);
            const { isResolved } = await markAsResolved([id]);
            setIsResolving(false);
            if (isResolved) {
              setremark(true);
            }
          }}
        >
          {isResolving ? (
            <ImSpinner2 className="animate-spin mr-1 text-green-600" />
          ) : (
            <AiFillCheckCircle
              className="cursor-pointer mr-1 text-green-600   hover:text-green-800"
              title="Mark as Resolved"
            />
          )}
        </button>
        <button
          onClick={async () => {
            setIsSuppressing(true);
            const { isFalsePositive } = await markAsFalsePositive([id]);
            if (isFalsePositive) {
              setremark(true);
            }
            setIsSuppressing(false);
          }}
          disabled={
            isMarkAsFalse ||
            isResolved ||
            isResolving ||
            remark ||
            isSuppressing ||
            isTicketRaised ||
            raisingTicket
          }
        >
          {isSuppressing ? (
            <ImSpinner2 className="animate-spin mr-1 text-red-600" />
          ) : (
            <ImCross
              className="cursor-pointer mx-1 text-red-600     hover:text-red-800"
              title="Mark as FP"
            />
          )}
        </button>
        <button
          onClick={async () => {
            setIsRaisingTicket(true);
            const { isFalsePositive } = await raiseJiraTicket(id);
            if (isFalsePositive) {
              setremark(true);
            }
            setIsRaisingTicket(false);
          }}
          disabled={
            isMarkAsFalse ||
            isResolved ||
            isResolving ||
            remark ||
            isSuppressing ||
            isTicketRaised ||
            raisingTicket
          }
        >
          {raisingTicket ? (
            <ImSpinner2 className="animate-spin mr-1 text-blue-600" />
          ) : (
            <SiJira
              className="cursor-pointer ml-1 text-blue-600 hover:text-blue-800"
              title="Raise Jira Ticket"
            />
          )}
        </button>
      </div>
    </TableData>
  );
};

export default QuickActions;
