export default function Occurance () : JSX.Element{
    return (
      <div
        className="mb-4
      bg-surface-md-dark
      border-gray-50 border border-opacity-20
    rounded-md 
    p-2 "
      >
        <span className="skeleton h-4 w-44 rounded mb-2 block" />
        <div className="w-full h-48 skeleton rounded-md" />
      </div>
    );
}