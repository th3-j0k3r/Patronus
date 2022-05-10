import type { FC } from 'react';

const RepositoryDescription: FC<{ description: string }> = ({
  description,
}) => {
  return (
    <div className="text-gray-50">
      <h5 className="font-semibold mb-3">Description</h5>
      <small>{description}</small>
    </div>
  );
};

export default RepositoryDescription;
