import type { DetailedHTMLProps, FC, InputHTMLAttributes } from 'react';

interface TableCheckboxOptions {
  options?: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
}

export const TableDataCheckBox: FC<TableCheckboxOptions> = ({ options }) => {
  return (
    <td className="px-2 bg-blueGray-50 text-blueGray-500 align-middle py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
      <div className="flex items-center">
        <input
          type="checkbox"
          {...options}
          className={
            options?.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }
        />
      </div>
    </td>
  );
};

export const TableHeaderCheckbox: FC<TableCheckboxOptions> = ({ options }) => {
  return (
    <th className="px-2 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
      <div className="flex items-center">
        <input
          type="checkbox"
          {...options}
          className={
            options?.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }
        />
      </div>
    </th>
  );
};
