import { Box, Center, Text } from '@mantine/core';
import { includes, isEmpty, map, pipe, sort } from 'ramda';
import { FC } from 'react';
import { useFileListStore } from '../states/files';

export const FileList: FC = () => {
  const files = useFileListStore.use.files();
  const activeFiles = useFileListStore.use.actives();

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
