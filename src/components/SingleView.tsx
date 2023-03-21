//@ts-nocheck
import EventEmitter from 'events';
import { find, gt, head, indexOf, isNil, lt, max, pluck, propEq } from 'ramda';
import { BaseSyntheticEvent, FC, useCallback, useContext, useMemo } from 'react';
import { useLifecycles, useMeasure } from 'react-use';
import { EventBusContext } from '../EventBus';
import { useFileListStore } from '../states/files';
import { useZoomState } from '../states/zoom';

export const SingleView: FC = () => {
  const files = useFileListStore.use.files();
  const actives = useFileListStore.use.actives();
  const { currentZoom: zoom, viewHeight, viewWidth } = useZoomState();
  const maxImageWidth = useMemo(() => viewWidth * (zoom / 100), [viewWidth, zoom]);
  const updateActives = useFileListStore.use.updateActiveFiles();
  const ebus = useContext<EventEmitter>(EventBusContext);
  const [pageConRef, { width: pageConWidth }] = useMeasure();
  const activeFile = useMemo(() => {
    let firstFile = head(actives);
    return find(propEq('filename', firstFile), files);
  }, [files, actives]);
  const largerThanView = useMemo(() => {
    if (isNil(activeFile)) return false;
    let imageHeightAfterZoom = activeFile?.height * (maxImageWidth / activeFile?.width);
    return gt(imageHeightAfterZoom, viewHeight);
  }, [activeFile, viewHeight, maxImageWidth]);
  const handlePaginationAction = useCallback(
    (event: BaseSyntheticEvent) => {
      let middle = pageConWidth / 2;
      let pagingDirection = lt(event.nativeEvent.offsetX, middle) ? -1 : 1;
      let targetIndex = indexOf(activeFile?.filename, pluck('filename', files)) + pagingDirection;
      updateActives([files[max(0, targetIndex)].filename]);
    },
    [files, activeFile, pageConWidth]
  );

  useLifecycles(
    () => {
      ebus?.addListener('navigate_offset', ({ filename }) => {
        updateActives([filename]);
      });
    },
    () => {
      ebus?.removeAllListeners('navigate_offset');
    }
  );

  return (
    <div
      style={{ position: 'relative', overflow: 'auto', contain: 'strict', height: '100%' }}
      onClick={handlePaginationAction}
      ref={pageConRef}
    >
      {!isNil(activeFile) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: largerThanView ? 'flex-start' : 'center',
            alignItems: 'center',
            width: '100%',
            height: largerThanView ? '100%' : viewHeight
          }}
        >
          <img src={activeFile.path} style={{ width: maxImageWidth }} />
        </div>
      )}
    </div>
  );
};
