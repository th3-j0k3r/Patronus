import { AnimatePresence } from 'framer-motion';
import type { Session } from 'next-auth';
import type { FC, ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { useSWRConfig } from '../hooks/useSWRConfig';
import Footer from './footer';
import Header from './header';
import SideNavBar from './sidenavbar';

interface Layout {
  children: ReactNode;
  session: Session;
}

const Layout: FC<Layout> = ({ children, session }) => {
  const { swrOptions } = useSWRConfig();

  return (
    <SWRConfig value={swrOptions}>
      <AnimatePresence exitBeforeEnter>
        {session ? (
          <main className="flex">
            <SideNavBar />

            <div className="w-full min-h-screen flex flex-col justify-between">
              <Header />
              <div className="p-4 sm:mt-0 mt-6 min-h-80vh">{children}</div>
              <Footer />
            </div>
          </main>
        ) : (
          children
        )}
      </AnimatePresence>
    </SWRConfig>
  );
};

export default Layout;
