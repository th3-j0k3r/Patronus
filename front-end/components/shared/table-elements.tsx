import type { DetailedHTMLProps, ReactNode, TdHTMLAttributes } from 'react';

export function TableHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}): JSX.Element {
  return (
    <th className="px-3 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
      <div className="flex items-center">
        <span>{title}</span>
        {children}
      </div>
    </th>
  );
}

export function TableData({
  title,
  children,
  options,
}: {
  title?: string;
  children?: ReactNode;
  options?: DetailedHTMLProps<
    TdHTMLAttributes<HTMLTableCellElement>,
    HTMLTableCellElement
  >;
}): JSX.Element {
  return (
    <td
      title={title}
      className="border-t-0 px-3 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 w-auto overflow-auto no-scroll-bar "
      {...options}
    >
      {children || title}
    </td>
  );
}
