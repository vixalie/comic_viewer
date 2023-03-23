//@ts-nocheck
import { Box, Center, Group, Text, TextInput, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { invoke } from '@tauri-apps/api';
import EventEmitter from 'events';
import { equals, find, head, includes, indexOf, isEmpty, length, not, pluck, propEq } from 'ramda';
import {
  FC,
  KeyboardEvent,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useMeasure } from 'react-use';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { EventBusContext } from '../EventBus';
import { useDirTreeStore } from '../states/dirs';
import { sortedFilesSelector, useFileListStore } from '../states/files';

export const FileList: FC = () => {
  const files = useFileListStore(sortedFilesSelector());
  const storeFiles = useFileListStore.use.updateFiles();
  const activeFiles = useFileListStore.use.actives();
  const cwd = useDirTreeStore.use.selected();
  const directories = useDirTreeStore.use.directories();
  const ebus = useContext<EventEmitter>(EventBusContext);
  const filesCount = useMemo(() => length(files), [files]);
  const [editingFile, setEditing] = useState<string | null>(null);
  const [parentRef, { height: parentHeight }] = useMeasure();
  const listRef = useRef<VirtuosoHandle | null>(null);
  const handleFileSelectAction = useCallback(
    (filename: string) => {
      ebus.emit('navigate_offset', { filename });
    },
    [ebus]
  );
  const handleFileRenameAction = useCallback(
    async (fileId: string, event: KeyboardEvent<HTMLInputElement>) => {
      if (equals(event.key, 'Enter')) {
        const newFileName = event.target.value;
        const originalFile = find(propEq('id', fileId), files);
        const storeDirectory = find(propEq('id', cwd), directories);
        try {
          await invoke('rename_file', {
            storePath: storeDirectory?.path,
            originName: originalFile?.filename,
            newName: newFileName
          });
          const refreshedFiles = await invoke('scan_directory', { target: storeDirectory?.path });
          storeFiles(refreshedFiles);
          ebus.emit('reset_views');
        } catch (e) {
          console.error('[debug]重命名文件：', e);
          notifications.show({ message: `重命名文件失败，${e}`, color: 'red' });
        }
        setEditing(null);
      }
    },
    [files, cwd, directories]
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
      pl={4}
      sx={{ flexGrow: 1, overflowY: 'auto', contain: 'strict', overflowX: 'hidden' }}
      ref={parentRef}
    >
      {!isEmpty(files) && (
        <Virtuoso
          style={{ height: parentHeight - 36 }}
          totalCount={filesCount}
          ref={listRef}
          itemContent={index => (
            <Box
              bg={includes(files[index].filename, activeFiles) && 'grape'}
              key={index}
              px={4}
              py={2}
              onClick={() => handleFileSelectAction(files[index].filename)}
              onDoubleClick={() => setEditing(files[index].id)}
              sx={theme => ({
                cursor: 'pointer',
                '&:hover': {
                  color: not(includes(files[index].filename, activeFiles)) && theme.colors.red
                }
              })}
            >
              <Tooltip label={files[index].filename} zIndex={999}>
                {propEq('id', editingFile)(files[index]) ? (
                  <Group>
                    <TextInput
                      defaultValue={files[index].filename}
                      size="xs"
                      variant="unstyled"
                      onKeyDown={event => handleFileRenameAction(files[index].id, event)}
                    />
                  </Group>
                ) : (
                  <Text truncate>{files[index].filename}</Text>
                )}
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
