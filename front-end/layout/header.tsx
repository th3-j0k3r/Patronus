import { signOut, useSession } from 'next-auth/client';
import type { FC } from 'react';
import { FaUserAlt } from 'react-icons/fa';

const Header: FC = () => {
  const [_, isLoading] = useSession();

  if (isLoading) {
    return null;
  }

  return (
    <header className="pl-4 pr-4 py-1  shadow-2xl bg-surface-dark">
      <div className="flex text-white items-center justify-end p-2">
        <FaUserAlt />
        <p
          onClick={() => signOut()}
          className="font-sans font-light text-xl text-white ml-2 text-right cursor-pointer py-1"
        >
          Logout
        </p>
      </div>
    </header>
  );
};

export default Header;
