import { NotificationsProvider } from "@mantine/notifications";
import React, { FC, useState } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { appRouter } from "./router";
import { useAppTheme } from "./theme";

const AppMain: FC = () => {
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme);
  const theme = useAppTheme();

  return (
    <React.StrictMode>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={setColorScheme}>
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
          <NotificationsProvider position="bottom-right" limit={5} zIndex={999}>
            <RouterProvider router={appRouter} />
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppMain />
  </React.StrictMode>
);
