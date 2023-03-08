import { Box, Center, Text } from '@mantine/core';
import EventEmitter from 'events';
import { includes, isEmpty, map, not, pipe, sort } from 'ramda';
import { FC, useCallback, useContext } from 'react';
import { EventBusContext } from '../EventBus';
import { useFileListStore } from '../states/files';

export const FileList: FC = () => {
  const files = useFileListStore.use.files();
  const activeFiles = useFileListStore.use.actives();
  const ebus = useContext<EventEmitter>(EventBusContext);
  const handleFileSelectAction = useCallback(
    (filename: string) => {
      ebus.emit('navigate_offset', { filename });
    },
    [ebus]
  );

  return (
    <Box w="100%" h="100%" pl={4} sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
      {pipe(
        sort((fa, fb) => fa.sort - fb.sort),
        map(item => (
          <Box
            bg={includes(item.filename, activeFiles) && 'grape'}
            key={item.filename}
            px={4}
            py={2}
            onClick={() => handleFileSelectAction(item.filename)}
            sx={theme => ({
              cursor: 'pointer',
              '&:hover': { color: not(includes(item.filename, activeFiles)) && theme.colors.red }
            })}
          >
            {item.filename}
          </Box>
        ))
      )(files)}
      {isEmpty(files) && (
        <Center h="100%">
          <Text size="xs">请先打开一个文件夹。</Text>
        </Center>
      )}
    </Box>
  );
};
