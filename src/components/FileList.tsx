import { Box, Center, Text } from '@mantine/core';
import { isEmpty, map, pipe, sort } from 'ramda';
import { FC } from 'react';
import { useFileListStore } from '../states/files';

export const FileList: FC = () => {
  const files = useFileListStore.use.files();
  console.log('[debug]files from store: ', files);

  return (
    <Box w="100%" h="100%" pl={4} sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
      {pipe(
        sort((fa, fb) => fa.sort - fb.sort),
        map(item => <div key={item.filename}>{item.filename}</div>)
      )(files)}
      {isEmpty(files) && (
        <Center h="100%">
          <Text size="xs">请先打开一个文件夹。</Text>
        </Center>
      )}
    </Box>
  );
};
