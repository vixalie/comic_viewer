import { Box } from '@mantine/core';
import { equals } from 'ramda';
import { FC, useLayoutEffect } from 'react';
import { useMeasure } from 'react-use';
import { useZoomState } from '../states/zoom';
import { ContinuationView } from './ContinuationView';
import { SingleView } from './SingleView';

export const ComicView: FC = () => {
  const viewMode = useZoomState.use.viewMode();
  const updateViewHeight = useZoomState.use.updateViewHeight();
  const [containerRef, { height }] = useMeasure();

  useLayoutEffect(() => {
    updateViewHeight(height);
  }, [height]);

  return (
    <Box w="100%" h="100%" sx={{ overflow: 'hidden' }} ref={containerRef}>
      {equals(viewMode, 'single') && <SingleView />}
      {equals(viewMode, 'continuation') && <ContinuationView />}
    </Box>
  );
};
