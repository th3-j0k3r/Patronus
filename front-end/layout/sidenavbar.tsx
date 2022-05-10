import type { FC } from 'react';
import { Fragment, useState } from 'react';
import { CgClose, CgMenuRightAlt } from 'react-icons/cg';
import { RiMenuFoldFill, RiMenuUnfoldFill } from 'react-icons/ri';
import BrandLogo from './brand-logo';
import NavItems from './navbar';

const SideNavBar: FC = () => {
  const [burgerActive, setBurgerActive] = useState<boolean>(false);
  const [expandedMenu, setExpandedMenu] = useState<boolean>(false);

  return (
    <Fragment>
      <div
        className={`z-10 bg-surface-dark shadow-2xl fixed top-0 left-0  
        transform transition-all duration-300 sm:min-h-screen sm:bottom-0 w-full ${
          expandedMenu
            ? 'xl:w-1/5 lg:w-1/4 md:w-1/3 sm:w-1/2   p-4'
            : 'p-2 sm:w-20  '
        } ${burgerActive ? 'min-h-screen' : ''}`}
      >
        <div className="flex justify-between items-center text-white mb-2">
          <BrandLogo isExpanded={expandedMenu} />
          <div className="w-full sm:flex hidden justify-end">
            {expandedMenu ? (
              <RiMenuFoldFill
                className="text-2xl cursor-pointer"
                onClick={() => setExpandedMenu(false)}
              />
            ) : (
              <RiMenuUnfoldFill
                className="text-2xl cursor-pointer"
                onClick={() => setExpandedMenu(true)}
              />
            )}
          </div>
          {!burgerActive ? (
            <span>
              <CgMenuRightAlt
                fontSize={40}
                className="sm:hidden cursor-pointer"
                onClick={() => setBurgerActive(!burgerActive)}
              />
            </span>
          ) : (
            <span>
              <CgClose
                fontSize={40}
                className="sm:hidden cursor-pointer"
                onClick={() => setBurgerActive(!burgerActive)}
              />
            </span>
          )}
        </div>

        {/* desktop view */}
        <div className=" sm:block hidden h-full">
          <NavItems
            expandedMenu={expandedMenu}
            absoluteSetting={true}
            showNavBar={true}
          />
        </div>

        <div className="sm:hidden block ">
          <NavItems
            expandedMenu={expandedMenu}
            absoluteSetting={false}
            showNavBar={burgerActive}
            toggleBurgerMenu={setBurgerActive}
          />
        </div>
      </div>
      <div
        id="clearfix"
        className={`${
          expandedMenu
            ? 'xl:mr-20% lg:mr-25% md:mr-33.33%  sm:mr-50% sm:mb-28'
            : 'sm:ml-20'
        }`}
      />
    </Fragment>
  );
};

export default SideNavBar;
