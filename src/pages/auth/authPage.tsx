import {
  Icon24EditorCutOutline,
  Icon28LogoVkColor,
  Icon56GhostOutline,
} from "@vkontakte/icons";
import { Button, Group, Link, Panel, Placeholder, View } from "@vkontakte/vkui";
import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { BigBallsLoading } from "../../components/bigBallsLoading";
import { IdentityCard } from "../../components/identityCard";
import {
  CLIENT_ID,
  COOKIE_API_TOKEN_KEY,
  COOKIE_VK_TOKEN_KEY,
  LOCAL_URL,
} from "../../constants";
import { AdaptivePanelHeader } from "../../helpers/adaptivePanelHeader";
import { useNngApiStore } from "../../store/apiStore";
import { useVkStore } from "../../store/vkStore";
import { VkUser } from "../../vk/models/vkUser";

type AuthorizeProps = {
  authorized: boolean;
  setAuthorized: (authorized: boolean) => void;
};
const cookies = new Cookies();

export const AuthorizePage = (props: AuthorizeProps) => {
  const link = `https://oauth.vk.ru/authorize?client_id=${CLIENT_ID}&redirect_uri=${LOCAL_URL}/auth&response_type=code`;

  const navigate = useNavigate();
  const { authorized, setAuthorized } = props;

  const [fetching, setFetching] = React.useState(true);
  const [user, setUser] = React.useState<VkUser | null>(null);

  const vkStore = useVkStore();
  const apiStore = useNngApiStore();

  const resetAuthorization = useCallback(() => {
    cookies.remove(COOKIE_VK_TOKEN_KEY);
    cookies.remove(COOKIE_API_TOKEN_KEY);
    setAuthorized(false);
  }, [setAuthorized]);

  const authorizeUser = useCallback(async () => {
    if (!authorized) {
      setFetching(false);
      return;
    }

    try {
      const userInfo = await vkStore.vkApi.getUsersInfo([
        apiStore.currentUserId,
      ]);
      setUser(userInfo[0]);
      setAuthorized(true);
    } catch (error) {
      console.log(error);
      resetAuthorization();
    } finally {
      setFetching(false);
    }
  }, [
    apiStore.currentUserId,
    authorized,
    resetAuthorization,
    setAuthorized,
    vkStore.vkApi,
  ]);

  useEffect(() => {
    authorizeUser().then();
  }, [authorizeUser]);

  if (fetching) {
    return <BigBallsLoading />;
  }

  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        <Group>
          {!authorized && (
            <Placeholder
              icon={<Icon56GhostOutline />}
              header="Авторизация через ВКонтакте"
              action={
                <Button size="l" before={<Icon28LogoVkColor />} href={link}>
                  Войти через VK ID
                </Button>
              }
            >
              Чтобы продолжить, необходимо авторизоваться.
            </Placeholder>
          )}
          {authorized && (
            <IdentityCard
              upper="Вход выполнен от имени:"
              avatar={user?.photo200}
              title={`${user?.firstName} ${user?.lastName}`}
              subtitle={
                <React.Fragment>
                  Можно <Link onClick={() => resetAuthorization()}>выйти</Link>{" "}
                  или <Link href={link}>переавторизоваться</Link>
                </React.Fragment>
              }
            >
              <Button
                size="l"
                before={<Icon28LogoVkColor />}
                href={`https://vk.ru/id${user?.id}`}
                target="_blank"
                mode="primary"
              >
                Открыть страницу ВКонтакте
              </Button>
              <Button
                size="m"
                before={<Icon24EditorCutOutline />}
                onClick={() => {
                  navigate(`users/${apiStore.currentUserId}`);
                }}
                mode="secondary"
              >
                Редактировать профиль
              </Button>
            </IdentityCard>
          )}
        </Group>
      </Panel>
    </View>
  );
};
