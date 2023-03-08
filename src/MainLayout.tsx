import { Box, Group } from "@mantine/core";
import { FC } from "react";
import { Outlet } from "react-router-dom";
import { NavMenu } from "./NavMenu";

export const MainLayout: FC = () => {
  return (
    <Group grow noWrap spacing={0} h="100%" w="100%">
      <NavMenu />
      <Box h="inherit" w="inherit" maw="100%" sx={{ flexGrow: 5 }}>
        <Outlet />
      </Box>
    </Group>
  );
};
