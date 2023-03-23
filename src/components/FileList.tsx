//@ts-nocheck
import { Box, Center, Text, Tooltip } from '@mantine/core';
import EventEmitter from 'events';
import { head, includes, indexOf, isEmpty, length, not, pluck } from 'ramda';
import { FC, useCallback, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { useMeasure } from 'react-use';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { EventBusContext } from '../EventBus';
import { sortedFilesSelector, useFileListStore } from '../states/files';

export const FileList: FC = () => {
  const files = useFileListStore(sortedFilesSelector());
  const activeFiles = useFileListStore.use.actives();
  const ebus = useContext<EventEmitter>(EventBusContext);
  const filesCount = useMemo(() => length(files), [files]);
  const [parentRef, { height: parentHeight }] = useMeasure();
  const listRef = useRef<VirtuosoHandle | null>(null);
  const handleFileSelectAction = useCallback(
    (filename: string) => {
      ebus.emit('navigate_offset', { filename });
    },
    [ebus]
  );

  useLayoutEffect(() => {
    let firstActived = head(activeFiles);
    let firstActivedIndex = indexOf(firstActived, pluck('filename', files));
    listRef.current?.scrollToIndex({
      index: firstActivedIndex,
      align: 'center'
    });
  }, [activeFiles]);

  return (
    <Box
      w="100%"
      h="100%"
      pl={4}
      sx={{ flexGrow: 1, overflowY: 'auto', contain: 'strict', overflowX: 'hidden' }}
      ref={parentRef}
    >
      {!isEmpty(files) && (
        <Virtuoso
          style={{ height: parentHeight }}
          totalCount={filesCount}
          ref={listRef}
          itemContent={index => (
            <Box
              bg={includes(files[index].filename, activeFiles) && 'grape'}
              key={index}
              px={4}
              py={2}
              onClick={() => handleFileSelectAction(files[index].filename)}
              sx={theme => ({
                cursor: 'pointer',
                '&:hover': {
                  color: not(includes(files[index].filename, activeFiles)) && theme.colors.red
                }
              })}
            >
              <Tooltip label={files[index].filename} zIndex={999}>
                <Text truncate>{files[index].filename}</Text>
              </Tooltip>
            </Box>
          )}
        />
      )}
      {isEmpty(files) && (
        <Center h="100%">
          <Text size="xs">请先打开一个文件夹。</Text>
        </Center>
      )}
    </Box>
  );
};
