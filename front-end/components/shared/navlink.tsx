import cx from 'classnames';
import type { LinkProps } from 'next/link';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { PropsWithChildren, ReactElement } from 'react';
import { Children, cloneElement } from 'react';

type NavLinkProps = PropsWithChildren<LinkProps> & {
  activeClassName?: string;
};

export const NavLink = ({
  children,
  activeClassName = 'active',
  ...props
}: NavLinkProps) => {
  const { asPath } = useRouter();
  const child = Children.only(children) as ReactElement;
  const childClassName = child.props.className || '';

  const isActive = asPath === props.href || asPath === props.as;

  const className = cx(childClassName, { [activeClassName]: isActive });

  return (
    <Link {...props}>
      {cloneElement(child, {
        className: className || null,
      })}
    </Link>
  );
};
