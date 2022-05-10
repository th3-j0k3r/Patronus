import type { Dispatch, FC, SetStateAction } from 'react';
import { NavLink } from '../../components/shared/navlink';

interface NavLinkProps {
  title: string;
  className?: string;
  toggleButton?: Dispatch<SetStateAction<boolean>>;
  redirectLink: string;
  btnAriaTitle?: string;
  showTitle: boolean;
}

const NavBtn: FC<NavLinkProps> = ({
  title,
  className = '',
  children,
  toggleButton,
  redirectLink,
  btnAriaTitle,
  showTitle,
}) => {
  return (
    <NavLink href={redirectLink} activeClassName="nav-item-active">
      <a href={redirectLink} title={btnAriaTitle}>
        <button
          title={title}
          className={
            `shadow-2xl flex mb-4 items-center 
            regular-btn hover:bg-white 
            hover:text-black transform hover:-translate-y-0.5
            text-white bg-gray-50 bg-opacity-5 px-6 py-4 ` + className
          }
          onClick={() => {
            if (toggleButton) {
              toggleButton(false);
            }
          }}
          type="button"
        >
          <span className="text-sm">{children}</span>

          <span className="ml-2 font-normal cut-text-1">{title}</span>
        </button>
      </a>
    </NavLink>
  );
};

export default NavBtn;
