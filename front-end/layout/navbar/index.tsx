import { AnimatePresence, motion } from 'framer-motion';
import type { Dispatch, FC, SetStateAction } from 'react';
import { BsAsterisk } from 'react-icons/bs';
import {
  MdDocumentScanner,
  MdInventory,
  MdScatterPlot,
  MdSettings,
  MdSpaceDashboard,
} from 'react-icons/md';
import { VscGistSecret } from 'react-icons/vsc';
import NavBtn from './nav-btn';

interface NavItemsProps {
  absoluteSetting: boolean;
  showNavBar: boolean;
  toggleBurgerMenu?: Dispatch<SetStateAction<boolean>>;
  expandedMenu: boolean;
}

const NavItems: FC<NavItemsProps> = ({
  absoluteSetting,
  showNavBar,
  toggleBurgerMenu,
  expandedMenu,
}) => {
  if (!showNavBar) {
    return null;
  }

  return (
    <AnimatePresence exitBeforeEnter>
      <motion.div
        className={`pb-20 overflow-auto relative h-full`}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'tween', duration: 0.5 }}
        initial={{ opacity: 0 }}
      >
        <NavBtn
          showTitle={expandedMenu}
          redirectLink="/"
          title="Dashboard"
          toggleButton={toggleBurgerMenu}
          className="mt-4"
        >
          <MdSpaceDashboard />
        </NavBtn>
        <NavBtn
          showTitle={expandedMenu}
          redirectLink="/asset-inventory"
          title="Asset inventory"
          toggleButton={toggleBurgerMenu}
        >
          <MdInventory />
        </NavBtn>
        <NavBtn
          showTitle={expandedMenu}
          redirectLink="/software-composition-analysis"
          title="SCA"
          btnAriaTitle="Software Composition Analysis"
          toggleButton={toggleBurgerMenu}
        >
          <MdScatterPlot />
        </NavBtn>
        <NavBtn
          showTitle={expandedMenu}
          redirectLink="/secret-scanning"
          title="Secret scanning"
          toggleButton={toggleBurgerMenu}
        >
          <VscGistSecret />
        </NavBtn>
        <NavBtn
          showTitle={expandedMenu}
          redirectLink="/static-application-security-testing"
          title="SAST"
          toggleButton={toggleBurgerMenu}
          btnAriaTitle="Static Application Security Testing"
        >
          <BsAsterisk />
        </NavBtn>
        <NavBtn
          showTitle={expandedMenu}
          redirectLink="/on-demand-scan"
          title="On-demand scan"
          toggleButton={toggleBurgerMenu}
        >
          <MdDocumentScanner />
        </NavBtn>
{/* 
        <NavBtn
          showTitle={expandedMenu}
          redirectLink="/settings"
          toggleButton={toggleBurgerMenu}
          title="Settings"
          className={absoluteSetting ? 'absolute bottom-10' : ''}
        >
          <MdSettings />
        </NavBtn>  
         */}
      </motion.div>
    </AnimatePresence>
  );
};

export default NavItems;
