//@ts-nocheck
import EventEmitter from 'events';
import { indexOf, isEmpty, length, map, mergeLeft, pluck, range } from 'ramda';
import { FC, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { VariableSizeList } from 'react-window';
import { EventBusContext } from '../EventBus';
import { sortedFilesSelector, useFileListStore } from '../states/files';
import { useZoomState } from '../states/zoom';

export const ContinuationView: FC = () => {
  const files = useFileListStore(sortedFilesSelector());
  const zoom = useZoomState.use.currentZoom();
  const viewHeight = useZoomState.use.viewHeight();
  const updateActives = useFileListStore.use.updateActiveFiles();
  const fileCount = useMemo(() => length(files), [files]);
  const ebus = useContext<EventEmitter>(EventBusContext);
  const virtualListRef = useRef<VariableSizeList | null>();
  const handleOnRenderAction = useCallback(
    ({ visibleStartIndex, visibleStopIndex }) => {
      updateActives(map(i => files[i].filename, range(visibleStartIndex, visibleStopIndex + 1)));
    },
    [files]
  );
  const fileHeights = useMemo(() => map(item => item.height * (zoom / 100), files), [files, zoom]);

  useEffect(() => {
    ebus?.addListener('navigate_offset', ({ filename }) => {
      let index = indexOf(filename, pluck('filename', files));
      virtualListRef.current?.scrollToItem(index);
    });
    ebus?.addListener('reset_views', () => {
      virtualListRef.current?.scrollTo(0);
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
        <VariableSizeList
          itemData={files}
          itemCount={fileCount}
          itemSize={index => fileHeights[index]}
          itemKey={index => files[index].id}
          height={viewHeight}
          width="100%"
          ref={virtualListRef}
          onItemsRendered={handleOnRenderAction}
        >
          {({ index, style, data }) => (
            <div
              style={mergeLeft(style, {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-start'
              })}
            >
              <img src={data[index].path} style={{ width: data[index].width * (zoom / 100) }} />
            </div>
          )}
        </VariableSizeList>
      )}
    </div>
  );
};
