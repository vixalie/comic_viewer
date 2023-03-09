//@ts-nocheck
import { Stack, useMantineTheme } from '@mantine/core';
import { ifElse, path, propEq } from 'ramda';
import { FC, useMemo } from 'react';
import { FileList } from './components/FileList';
import { FileToolbar } from './components/FileTools';

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

  return (
    <Stack
      spacing={8}
      miw={200}
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
      <FileToolbar />
      <FileList />
    </Stack>
  );
};
