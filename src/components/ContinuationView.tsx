import { Box, Stack } from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import EventEmitter from 'events';
import { filter, indexOf, isEmpty, length, map, pluck } from 'ramda';
import { FC, useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useUpdate } from 'react-use';
import { EventBusContext } from '../EventBus';
import { useFileListStore } from '../states/files';
import { useZoomState } from '../states/zoom';
import { withinRange } from '../utils/offset_func';

export const ContinuationView: FC = () => {
  const forceRerender = useUpdate();
  const files = useFileListStore.use.files();
  const zoom = useZoomState.use.currentZoom();
  const viewHeight = useZoomState.use.viewHeight();
  const updateActives = useFileListStore.use.updateActiveFiles();
  const fileCount = useMemo(() => length(files), [files]);
  const parentRef = useRef();
  const ebus = useContext<EventEmitter>(EventBusContext);
  const virtualizer = useVirtualizer({
    count: fileCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100
  });
  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    ebus?.addListener('navigate_offset', ({ filename }) => {
      let index = indexOf(filename, pluck('filename', files));
      virtualizer.scrollToIndex(index);
    });
    ebus?.addListener('reset_views', () => {
      virtualizer.scrollToOffset(0);
    });

    return () => {
      ebus?.removeAllListeners('navigate_offset');
      ebus?.removeAllListeners('reset_views');
    };
  }, [ebus, files, virtualizer]);

  useEffect(() => {
    forceRerender();
  }, [files]);

  useLayoutEffect(() => {
    let rangeStart = virtualizer.scrollOffset;
    let rangeEnd = virtualizer.scrollOffset + viewHeight;
    let onShowItems = pluck(
      'index',
      filter(item => withinRange(item.start, item.end, rangeStart, rangeEnd), items)
    );
    updateActives(map(i => files[i].filename, onShowItems));
  }, [virtualizer.scrollOffset, viewHeight, items]);

  return (
    <div style={{ overflow: 'auto', contain: 'strict', height: '100%' }} ref={parentRef}>
      {!isEmpty(files) && (
        <Box pos="relative" w="100%" h={virtualizer.getTotalSize()}>
          <Stack
            pos="absolute"
            top={0}
            left={0}
            w="100%"
            justify="start"
            align="center"
            spacing={0}
            style={{
              transform: `translateY(${items[0].start}px)`
            }}
          >
            {items.map(row => (
              <img
                key={files[row.index].filename}
                src={files[row.index].path}
                ref={virtualizer.measureElement}
                data-index={row.index}
                style={{ width: `${zoom}%` }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </div>
  );
};
