import { Box, Stack } from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { filter, isEmpty, length, map, pluck } from 'ramda';
import { FC, useLayoutEffect, useMemo, useRef } from 'react';
import { useFileListStore } from '../states/files';
import { useZoomState } from '../states/zoom';
import { withinRange } from '../utils/offset_func';

export const ContinuationView: FC = () => {
  const files = useFileListStore.use.files();
  const zoom = useZoomState.use.currentZoom();
  const viewHeight = useZoomState.use.viewHeight();
  const updateActives = useFileListStore.use.updateActiveFiles();
  const fileCount = useMemo(() => length(files), [files]);
  const parentRef = useRef();
  const virtualizer = useVirtualizer({
    count: fileCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => zoom * 10
  });
  const items = virtualizer.getVirtualItems();

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
                src={convertFileSrc(files[row.index].path)}
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
