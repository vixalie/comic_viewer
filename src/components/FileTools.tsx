import { Button, Group, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconFolder } from '@tabler/icons-react';
import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';
import { FC, useCallback } from 'react';
import { useFileListStore } from '../states/files';

export const FileToolbar: FC = () => {
  const storeFiles = useFileListStore.use.updateFiles();
  const handleOpenAction = useCallback(async () => {
    try {
      const directory = await open({
        title: '打开要浏览的漫画所在的文件夹',
        directory: true,
        multiple: false
      });
      const files = await invoke('scan_directory', { target: directory });
      storeFiles(files);
    } catch (e) {
      console.error('[error]打开文件夹', e);
      notifications.show({ title: '未能成功打开指定文件夹，请重试。', color: 'red' });
    }
  }, [storeFiles]);

  return (
    <Group align="start" w="100%" spacing={4}>
      <Tooltip label="打开漫画所在文件夹">
        <Button
          size="xs"
          variant="subtle"
          fullWidth
          leftIcon={<IconFolder stroke={1.5} size={14} />}
          onClick={handleOpenAction}
        >
          打开文件夹
        </Button>
      </Tooltip>
    </Group>
  );
};
