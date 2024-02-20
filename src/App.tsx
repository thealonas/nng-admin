import "@vkontakte/vkui/dist/vkui.css";
import React, { useCallback, useEffect, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import { AuthCallback } from "./pages/auth/authCallback";
import { AuthorizePage } from "./pages/auth/authPage";
import { ErrorPage } from "./pages/errorPage";
import { GroupsPage } from "./pages/groups/groupsPage";
import { MainPage } from "./pages/mainPage";
import { RequestPage } from "./pages/requests/requestPage";
import { RequestsOverview } from "./pages/requests/requestsOverview";
import { TicketPage } from "./pages/tickets/ticketPage";
import { TicketsOverview } from "./pages/tickets/ticketsOverview";
import { UserPage } from "./pages/users/userPage";
import { UsersPage } from "./pages/users/usersOverview";
import { WatchdogOverview } from "./pages/watchdog/watchdogOverview";
import { WatchdogPage } from "./pages/watchdog/watchdogPage";
import { useStoreUpdater } from "./store/updater";
import { CommentPage } from "./pages/comments/commentPage";

function App() {
  const [popout, setPopout] = useState<React.JSX.Element | null>(null);

  const [fetching, setFetching] = useState(true);

  const [authorized, setAuthorized] = useState(false);
  const [getTokens, whoAmI, initializeStores] = useStoreUpdater();

  const updateStores = useCallback(async () => {
    setFetching(true);
    const [apiToken, vkToken] = await getTokens();
    const currentUserId: number = await whoAmI(apiToken);

    if (currentUserId === -1) {
      setAuthorized(false);
      setFetching(false);
      return;
    }

    initializeStores(vkToken, apiToken, currentUserId);
    setAuthorized(true);
    setFetching(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFetching]);

  useEffect(() => {
    updateStores().then();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateStores]);

  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: (
          <MainPage
            fetching={fetching}
            authorized={authorized}
            setAuthorized={setAuthorized}
            popout={popout}
            setPopout={setPopout}
          />
        ),
        errorElement: <ErrorPage />,
        children: [
          {
            path: "/",
            element: (
              <AuthorizePage
                authorized={authorized}
                setAuthorized={setAuthorized}
              />
            ),
          },
          {
            path: "/auth",
            element: <AuthCallback setAuthorized={setAuthorized} />,
          },
          {
            path: "/groups",
            element: <GroupsPage />,
          },
          {
            path: "/users",
            element: <UsersPage />,
          },
          {
            path: "/users/:id",
            element: <UserPage setPopout={setPopout} />,
          },
          {
            path: "/requests",
            element: <RequestsOverview />,
          },
          {
            path: "/requests/:id",
            element: <RequestPage />,
          },
          {
            path: "/watchdog",
            element: <WatchdogOverview />,
          },
          {
            path: "/watchdog/:id",
            element: <WatchdogPage />,
          },
          {
            path: "/tickets",
            element: <TicketsOverview />,
          },
          {
            path: "/tickets/:id",
            element: <TicketPage />,
          },
          {
            path: "/comments/:id",
            element: <CommentPage />,
          },
        ],
      },
    ],
    {
      basename: "",
    },
  );

  return <RouterProvider router={router} />;
}

export default App;
