//@ts-nocheck
import styled from '@emotion/styled';
import { ActionIcon, Box, Flex, Stack, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEye, IconSquareMinus, IconSquarePlus } from '@tabler/icons-react';
import { invoke } from '@tauri-apps/api';
import EventEmitter from 'events';
import { equals, isEmpty, isNil, map, not } from 'ramda';
import { FC, PropsWithChildren, useCallback, useContext } from 'react';
import { useLifecycles, useMeasure } from 'react-use';
import { EventBusContext } from '../EventBus';
import { DirItem } from '../models';
import { loadSubDirectories } from '../queries/directories';
import {
  currentRootsSelector,
  isExpandedSelector,
  subDirectoriesSelector,
  useDirTreeStore
} from '../states/dirs';
import { useFileListStore } from '../states/files';

const Tree = styled.ul`
  --spacing: 0.5rem;
  list-style-type: none;
  list-style-position: outside;
  padding: 0;
  margin: 0;
  width: max-content;
  li ul {
    padding-left: calc(2 * var(--spacing));
  }
`;

const Branch: FC<PropsWithChildren<{ current: DirItem }>> = ({ children, current }) => {
  const { directories: allSubDirs } = useDirTreeStore();
  const subDirs = useDirTreeStore(subDirectoriesSelector(current.id));
  const isCurrentExpanded = useDirTreeStore(isExpandedSelector(current.id));
  const expend = useDirTreeStore.use.expandDir();
  const fold = useDirTreeStore.use.foldDir();
  const selectDir = useDirTreeStore.use.selectDirectory();
  const selectedDirectory = useDirTreeStore.use.selected();
  const storeFiles = useFileListStore.use.updateFiles();
  const ebus = useContext<EventEmitter>(EventBusContext);

  useLifecycles(
    () => {
      ebus.addListener(`expand:${current.id}`, () => {
        expend(current.id);
        loadSubDirectories(current);
      });
    },
    () => {
      ebus.removeAllListeners(`expand:${current.id}`);
    }
  );

  const handleExpandAction = useCallback(async () => {
    try {
      if (isCurrentExpanded) {
        fold(current.id);
      } else {
        await loadSubDirectories(current);
        expend(current.id);
      }
    } catch (e) {
      notifications.show({
        message: `未能成功加载指定文件夹下的子文件夹，${e}`,
        color: 'red'
      });
    }
  }, [current, allSubDirs, isCurrentExpanded]);
  const handleSelectAction = useCallback(async () => {
    try {
      selectDir(current.id);
      const files = await invoke('scan_directory', { target: current.path });
      storeFiles(files);
      ebus.emit('reset_views');
    } catch (e) {
      console.error('[error]打开文件夹', e);
      notifications.show({ message: `未能成功打开指定文件夹，请重试。${e}`, color: 'red' });
    }
  }, [current]);

  return (
    <li>
      <Flex direction="row" justify="flex-start" align="center" spacing={8} maw={250}>
        <ActionIcon onClick={handleExpandAction}>
          {isCurrentExpanded ? (
            <IconSquareMinus stroke={1.5} size={16} />
          ) : (
            <IconSquarePlus stroke={1.5} size={16} />
          )}
        </ActionIcon>
        <Tooltip label={children}>
          <Text
            size="sm"
            truncate
            onClick={handleSelectAction}
            sx={{ cursor: 'pointer' }}
            bg={equals(current.id, selectedDirectory) && 'blue'}
          >
            {children}
          </Text>
        </Tooltip>
      </Flex>
      {not(isEmpty(subDirs)) && isCurrentExpanded && (
        <Tree>
          {map(
            item => (
              <Branch key={item.id} current={item}>
                {item.dirname}
              </Branch>
            ),
            subDirs
          )}
        </Tree>
      )}
    </li>
  );
};

export const DirTree: FC = () => {
  const roots = useDirTreeStore(currentRootsSelector());
  const { focused, focus, unfocus, selected, foldDir } = useDirTreeStore();
  const [viewRef, { width }] = useMeasure();
  const storeFiles = useFileListStore.use.updateFiles();
  const ebus = useContext<EventEmitter>(EventBusContext);

  const handleFocusAction = useCallback(() => {
    if (isNil(focused) && not(isNil(selected))) {
      ebus.emit(`expand:${selected}`);
      focus(selected);
    } else {
      foldDir(focused.id);
      unfocus();
    }
  }, [focused, selected]);

  return (
    <Stack
      w="auto"
      h="100%"
      spacing={8}
      px={4}
      py={4}
      pos="relative"
      sx={{ overflow: 'auto' }}
      ref={viewRef}
    >
      <Box pos="fixed" style={{ transform: `translateX(${width * 0.85}px)` }}>
        <Tooltip label={isNil(focused) ? '聚焦当前选择的目录' : '解除聚焦'}>
          <ActionIcon
            variant="light"
            color={isNil(focused) ? 'grape' : 'green'}
            disabled={isNil(selected)}
            onClick={handleFocusAction}
          >
            <IconEye stroke={1.5} size={16} />
          </ActionIcon>
        </Tooltip>
      </Box>
      <Tree>
        {map(
          item => (
            <Branch key={item.id} current={item}>
              {item.dirname}
            </Branch>
          ),
          roots
        )}
      </Tree>
    </Stack>
  );
};
