export default function Description(): JSX.Element {
  return (
    <div>
      <span className="skeleton h-4 w-32 rounded block mb-3" />
      {new Array(6).fill('').map((_, idx) => {
        return (
          <span className="skeleton h-4 w-3/4 rounded block mb-1" key={idx} />
        );
      })}
    </div>
  );
}
