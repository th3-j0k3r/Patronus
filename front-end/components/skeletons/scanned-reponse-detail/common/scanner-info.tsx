export default function ScannedInfo({ cols }: { cols: 1 | 2 }): JSX.Element {
  return (
    <div
      className="mb-4
      bg-surface-md-dark
      border-gray-50 border border-opacity-20
    rounded-md 
    p-2 
    pb-1"
    >
      <div className="grid lg:grid-cols-2 grid-cols-1">
        <div>
          {new Array(4).fill('').map((_, idx) => {
            return (
              <div className="flex  mb-2 " key={idx}>
                <span className="skeleton h-4 w-32 rounded" />
                <span className="mx-6 h-4 w-1 skeleton rounded" />
                <span className="skeleton h-4 w-44 rounded" />
              </div>
            );
          })}
        </div>
        {cols === 2 ? (
          <div>
            {new Array(4).fill('').map((_, idx) => {
              return (
                <div className="flex mb-2" key={idx}>
                  <span className="skeleton h-4 w-32 rounded" />
                  <span className="mx-6 h-4 w-1 skeleton rounded" />
                  <span className="skeleton h-4 w-44 rounded" />
                </div>
              );
            })}
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
