import type { DetailedHTMLProps, FC, SelectHTMLAttributes } from 'react';
import { BsChevronDown } from 'react-icons/bs';

interface SelectInputProps {
  options?: DetailedHTMLProps<
    SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >;
}

const SelectInput: FC<SelectInputProps> = ({ options, children }) => {
  return (
    <div className="relative ">
      <select {...options}>{children}</select>
      <div className="absolute text-gray-50 right-0 top-0 h-full flex items-center mx-1">
        <BsChevronDown />
      </div>
    </div>
  );
};

export default SelectInput;
