//@ts-nocheck
import { Stack, Tabs, useMantineTheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconFiles, IconFolders } from '@tabler/icons-react';
import { ifElse, path, propEq } from 'ramda';
import { FC, useMemo } from 'react';
import { useMount } from 'react-use';
import { DirTree } from './components/DirTree';
import { FileList } from './components/FileList';
import { loadDrives } from './queries/directories';

const bgSelectFn = ifElse(
  propEq('colorScheme', 'dark'),
  path(['colors', 'cbg', 2]),
  path(['colors', 'cbg', 7])
);

export const NavMenu: FC = () => {
  const theme = useMantineTheme();
  const normalColor = useMemo(() => path(['violet', 7])(theme.colors), [theme.colors]);
  const activatedColor = useMemo(() => path<string>(['violet', 3])(theme.colors), [theme.colors]);
  const disabledColor = useMemo(() => path<string>(['gray', 7])(theme.colors), [theme.colors]);
  const navMenuBg = useMemo(() => bgSelectFn(theme), [theme, theme]);

  useMount(() => {
    try {
      loadDrives();
    } catch (e) {
      notifications.show({ message: `未能成功加载全部磁盘列表，${e.message}`, color: 'red' });
    }
  });

  return (
    <Stack
      spacing={8}
      w={300}
      mw={200}
      h="inherit"
      sx={theme => ({
        flexGrow: 1,
        backgroundColor: navMenuBg,
        overflow: 'hidden'
      })}
      px={4}
      py={4}
      align="center"
    >
      <Tabs defaultValue="folder" w="100%" h="100%">
        <Tabs.List>
          <Tabs.Tab value="folder" icon={<IconFolders stroke={1.5} size={16} />}>
            文件夹
          </Tabs.Tab>
          <Tabs.Tab value="files" icon={<IconFiles stroke={1.5} size={16} />}>
            文件列表
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="folder" h="100%">
          <DirTree />
        </Tabs.Panel>
        <Tabs.Panel value="files" h="100%">
          <Stack spacing={8} py={4} w="100%" h="100%" align="center">
            <FileList />
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};
