import {
  Icon28ChatsOutline,
  Icon28MasksOutline,
  Icon28MessagesOutline,
  Icon28MoonOutline,
  Icon28ShieldKeyholeOutline,
  Icon28SunOutline,
  Icon28UserOutline,
  Icon28Users3Outline,
} from "@vkontakte/icons";
import {
  AdaptivityProvider,
  AppRoot,
  Badge,
  ConfigProvider,
  Counter,
  Epic,
  Group,
  Panel,
  PanelHeader,
  Placeholder,
  SimpleCell,
  Spinner,
  SplitCol,
  SplitLayout,
  Tabbar,
  TabbarItem,
  View,
  useAdaptivityConditionalRender,
} from "@vkontakte/vkui";
import { AppearanceType } from "@vkontakte/vkui/dist/lib/appearance";
import "@vkontakte/vkui/dist/vkui.css";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { NotAuthorizedError } from "../components/notAuthorizedError";
import { LOCAL_URL } from "../constants";
import { useNngApiStore } from "../store/apiStore";
import { GetUpdates } from "../api/categories/utilsCategory";

type MainPageProps = {
  authorized: boolean;
  fetching: boolean;
  setAuthorized: (authorized: boolean) => void;
  popout: JSX.Element | null;
  setPopout: (popout: JSX.Element | null) => void;
};

export const MainPage = (props: MainPageProps) => {
  const navigate = useNavigate();
  const apiStore = useNngApiStore();

  const fullUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

  const [appearance, setAppearance] = useState<AppearanceType>("dark");
  const { viewWidth } = useAdaptivityConditionalRender();

  const canNotUseWebsite = !props.authorized;

  const [updates, setUpdates] = useState<GetUpdates>();

  useEffect(() => {
    if (canNotUseWebsite) {
      return;
    }

    apiStore.nngApi.utils
      .getUpdates()
      .then((updates) => {
        setUpdates(updates);
        console.log(updates);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [apiStore, setUpdates, canNotUseWebsite]);

  const currentPathIs = (arg: string): boolean => {
    return fullUrl.replace(LOCAL_URL, "").startsWith(`/${arg}`);
  };

  const isInCategory: boolean =
    currentPathIs("groups") ||
    currentPathIs("users") ||
    currentPathIs("watchdog") ||
    currentPathIs("tickets") ||
    currentPathIs("requests");

  const goToPage = (path: string) => {
    navigate(path);
  };

  const switchAppearance = () => {
    setAppearance(appearance === "light" ? "dark" : "light");
  };

  const groupsNav = (
    <SimpleCell
      before={<Icon28Users3Outline />}
      disabled={canNotUseWebsite}
      onClick={() => {}}
      activated={currentPathIs("groups")}
    >
      Группы
    </SimpleCell>
  );

  const usersNav = (
    <SimpleCell
      href="/users"
      before={<Icon28UserOutline />}
      onClick={() => {}}
      disabled={canNotUseWebsite}
      activated={currentPathIs("users")}
    >
      Пользователи
    </SimpleCell>
  );

  const watchdogNav = (
    <SimpleCell
      before={<Icon28ShieldKeyholeOutline />}
      badgeAfterTitle={
        updates?.watchdog != null && updates.watchdog > 0 ? (
          <Badge mode={"new"}>Есть новые</Badge>
        ) : undefined
      }
      disabled={canNotUseWebsite}
      onClick={() => {}}
      activated={currentPathIs("watchdog")}
    >
      Вачдог
    </SimpleCell>
  );

  const ticketsNav = (
    <SimpleCell
      before={<Icon28ChatsOutline />}
      badgeAfterTitle={
        updates?.tickets != null && updates.tickets > 0 ? (
          <Badge mode={"new"}>Есть новые</Badge>
        ) : undefined
      }
      disabled={canNotUseWebsite}
      onClick={() => {}}
      activated={currentPathIs("tickets")}
    >
      Тикеты
    </SimpleCell>
  );

  const requestsNav = (
    <SimpleCell
      before={<Icon28MasksOutline />}
      badgeAfterTitle={
        updates?.requests != null && updates.requests > 0 ? (
          <Badge mode={"new"}>Есть новые</Badge>
        ) : undefined
      }
      disabled={canNotUseWebsite}
      onClick={() => {}}
      activated={currentPathIs("requests")}
    >
      Запросы
    </SimpleCell>
  );

  const renderNav = (element: React.ReactNode, url: string) => {
    if (canNotUseWebsite) {
      return element;
    }

    return (
      <Link
        to={url}
        style={{
          textDecoration: "none",
        }}
      >
        {element}
      </Link>
    );
  };

  return (
    <ConfigProvider platform={"ios"} appearance={appearance}>
      <AdaptivityProvider>
        <AppRoot>
          <SplitLayout
            header={<PanelHeader delimiter="none" />}
            style={{ justifyContent: "center" }}
            popout={props.popout}
          >
            {viewWidth.tabletPlus && (
              <SplitCol
                fixed
                width={280}
                maxWidth={280}
                className={viewWidth.tabletPlus.className}
              >
                <View activePanel="main">
                  <Panel id="main">
                    <PanelHeader>
                      <NavLink
                        to={"/"}
                        style={{
                          textDecoration: "none",
                          color: appearance === "dark" ? "white" : "black",
                        }}
                      >
                        🍍 nng admin
                      </NavLink>
                    </PanelHeader>
                    <Group>
                      <Group mode="plain">
                        {renderNav(groupsNav, "/groups")}
                        {renderNav(usersNav, "/users")}
                        {renderNav(watchdogNav, "/watchdog")}
                        {renderNav(ticketsNav, "/tickets")}
                        {renderNav(requestsNav, "/requests")}
                      </Group>
                      <Group mode="plain">
                        {appearance === "dark" ? (
                          <SimpleCell
                            before={<Icon28SunOutline />}
                            onClick={switchAppearance}
                          >
                            Светлая тема
                          </SimpleCell>
                        ) : (
                          <SimpleCell
                            before={<Icon28MoonOutline />}
                            onClick={switchAppearance}
                          >
                            Тёмная тема
                          </SimpleCell>
                        )}
                      </Group>
                    </Group>
                  </Panel>
                </View>
              </SplitCol>
            )}

            <SplitCol
              width="100%"
              maxWidth="660px"
              stretchedOnMobile
              autoSpaced
            >
              <Epic
                activeStory="main"
                tabbar={
                  viewWidth.tabletMinus && (
                    <Tabbar
                      mode="vertical"
                      className={viewWidth.tabletMinus.className}
                    >
                      <TabbarItem
                        text="Группы"
                        selected={currentPathIs("groups")}
                        disabled={canNotUseWebsite}
                        onClick={() => goToPage("/groups")}
                      >
                        <Icon28Users3Outline />
                      </TabbarItem>
                      <TabbarItem
                        text="Пользователи"
                        selected={currentPathIs("users")}
                        disabled={canNotUseWebsite}
                        onClick={() => goToPage("/users")}
                      >
                        <Icon28UserOutline />
                      </TabbarItem>
                      <TabbarItem
                        text="Вачдог"
                        selected={currentPathIs("watchdog")}
                        indicator={
                          updates?.watchdog && updates.watchdog > 0 ? (
                            <Counter size="s" mode="prominent">
                              {updates.watchdog}
                            </Counter>
                          ) : undefined
                        }
                        disabled={canNotUseWebsite}
                        onClick={() => goToPage("/watchdog")}
                      >
                        <Icon28ShieldKeyholeOutline />
                      </TabbarItem>
                      <TabbarItem
                        text="Тикеты"
                        selected={currentPathIs("tickets")}
                        indicator={
                          updates?.tickets && updates.tickets > 0 ? (
                            <Counter size="s" mode="prominent">
                              {updates.tickets}
                            </Counter>
                          ) : undefined
                        }
                        disabled={canNotUseWebsite}
                        onClick={() => goToPage("/tickets")}
                      >
                        <Icon28MessagesOutline />
                      </TabbarItem>
                      <TabbarItem
                        text="Запросы"
                        selected={currentPathIs("requests")}
                        indicator={
                          updates?.requests && updates.requests > 0 ? (
                            <Counter size="s" mode="prominent">
                              {updates.requests}
                            </Counter>
                          ) : undefined
                        }
                        disabled={canNotUseWebsite}
                        onClick={() => goToPage("/requests")}
                      >
                        <Icon28MasksOutline />
                      </TabbarItem>
                    </Tabbar>
                  )
                }
              >
                {props.fetching ? (
                  <View activePanel="main">
                    <Panel id="main">
                      <PanelHeader />
                      <Group>
                        <Placeholder>
                          <Spinner />
                        </Placeholder>
                      </Group>
                    </Panel>
                  </View>
                ) : !props.authorized && isInCategory ? (
                  <NotAuthorizedError />
                ) : (
                  <div
                    id="main"
                    style={{
                      height: "100%",
                    }}
                  >
                    <Outlet />
                  </div>
                )}
              </Epic>
            </SplitCol>
          </SplitLayout>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};
