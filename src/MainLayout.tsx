import { Group, Stack } from '@mantine/core';
import { FC } from 'react';
import { ComicView } from './components/ComicView';
import { PicToolbar } from './components/PicToolbar';
import { NavMenu } from './NavMenu';

export const MainLayout: FC = () => {
  return (
    <Group grow noWrap spacing={0} h="100%" w="100%">
      <NavMenu />
      <Stack h="inherit" w="inherit" maw="100%" sx={{ flexGrow: 5 }} spacing={0}>
        <PicToolbar />
        <ComicView />
      </Stack>
    </Group>
  );
};
