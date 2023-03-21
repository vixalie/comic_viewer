//@ts-nocheck
import EventEmitter from 'events';
import { indexOf, isEmpty, length, map, pluck, range } from 'ramda';
import { FC, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { ListRange, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { EventBusContext } from '../EventBus';
import { sortedFilesSelector, useFileListStore } from '../states/files';
import { useZoomState } from '../states/zoom';

export const ContinuationView: FC = () => {
  const files = useFileListStore(sortedFilesSelector());
  const { currentZoom: zoom, viewWidth, viewHeight } = useZoomState();
  const updateActives = useFileListStore.use.updateActiveFiles();
  const fileCount = useMemo(() => length(files), [files]);
  const ebus = useContext<EventEmitter>(EventBusContext);
  const virtualListRef = useRef<VirtuosoHandle | null>(null);
  const handleOnRenderAction = useCallback(
    ({ startIndex, endIndex }: ListRange) => {
      updateActives(map(i => files[i].filename, range(startIndex, endIndex + 1)));
    },
    [files]
  );
  const maxImageWidth = useMemo(() => Math.floor(viewWidth * (zoom / 100)), [viewWidth, zoom]);

  useEffect(() => {
    ebus?.addListener('navigate_offset', ({ filename }) => {
      let index = indexOf(filename, pluck('filename', files));
      virtualListRef.current?.scrollToIndex({ index, align: 'start', behavior: 'smooth' });
    });
    ebus?.addListener('reset_views', () => {
      virtualListRef.current?.scrollTo({ top: 0 });
    });
    return () => {
      ebus?.removeAllListeners('navigate_offset');
      ebus?.removeAllListeners('reset_views');
    };
  }, [files]);

  return (
    <div
      style={{
        overflow: 'auto',
        contain: 'strict',
        height: '100%'
      }}
    >
      {!isEmpty(files) && (
        <Virtuoso
          style={{ height: viewHeight }}
          ref={virtualListRef}
          totalCount={fileCount}
          computeItemKey={index => files[index].id}
          rangeChanged={handleOnRenderAction}
          itemContent={index => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-start',
                width: '100%',
                height: Math.round(files[index].height * (maxImageWidth / files[index].width))
              }}
            >
              <img src={files[index].path} style={{ width: maxImageWidth }} />
            </div>
          )}
        />
      )}
    </div>
  );
};
