import { Stack, useMantineTheme } from "@mantine/core";
import { ifElse, path, propEq } from "ramda";
import { FC, useMemo } from "react";

const bgSelectFn = ifElse(
  propEq("colorScheme", "dark"),
  path(["colors", "cbg", 2]),
  path(["colors", "cbg", 7])
);

export const NavMenu: FC = () => {
  const theme = useMantineTheme();
  const normalColor = useMemo(() => path(["violet", 7])(theme.colors), [theme.colors]);
  const activatedColor = useMemo(() => path<string>(["violet", 3])(theme.colors), [theme.colors]);
  const disabledColor = useMemo(() => path<string>(["gray", 7])(theme.colors), [theme.colors]);
  const navMenuBg = useMemo(() => bgSelectFn(theme), [theme, theme]);

  return (
    <Stack
      spacing={24}
      maw={64}
      h="inherit"
      sx={(theme) => ({
        flexGrow: 1,
        backgroundColor: navMenuBg,
      })}
      align="center"
      px={16}
      py={16}
    ></Stack>
  );
};
