//@ts-nocheck
import { Box } from '@mantine/core';
import { equals, head } from 'ramda';
import { FC, useLayoutEffect, useMemo } from 'react';
import { useMeasure, useUpdate } from 'react-use';
import { sortedFilesSelector, useFileListStore } from '../states/files';
import { useZoomState } from '../states/zoom';
import { ContinuationView } from './ContinuationView';
import { SingleView } from './SingleView';

export const ComicView: FC = () => {
  const forceUpdate = useUpdate();
  const files = useFileListStore(sortedFilesSelector());
  const viewMode = useZoomState.use.viewMode();
  const updateViewHeight = useZoomState.use.updateViewHeight();
  const updateViewWidth = useZoomState.use.updateViewWidth();
  const [containerRef, { height, width }] = useMeasure();
  const firstFileId = useMemo(() => head(files)?.id ?? '', [files, files.length]);

  useLayoutEffect(() => {
    updateViewHeight(height);
  }, [height]);
  useLayoutEffect(() => {
    updateViewWidth(width);
  }, [width]);

  return (
    <Box w="100%" h="100%" sx={{ overflow: 'hidden' }} ref={containerRef}>
      {equals(viewMode, 'single') && <SingleView />}
      {equals(viewMode, 'continuation') && <ContinuationView key={firstFileId} />}
    </Box>
  );
};
