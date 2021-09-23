import React from 'react';
import { useStopwatch } from '@components';
import { formatStopwatch } from '@utils';

const Stopwatch: React.FC<{ className: string }> = ({ className }) => {
  const progress = useStopwatch();
  const formattedDate = formatStopwatch(progress, true);

  return (
    <time dateTime={formattedDate} className={className}>
      {formattedDate}
    </time>
  );
};

export { Stopwatch };
