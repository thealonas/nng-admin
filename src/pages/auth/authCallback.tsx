import {
  Icon56CheckCircleOutline,
  Icon56GlobeCrossOutline,
} from "@vkontakte/icons";
import {
  Button,
  Group,
  Header,
  Panel,
  Placeholder,
  ScreenSpinner,
  View,
} from "@vkontakte/vkui";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { NngApi } from "../../api/nngApi";
import { COOKIE_API_TOKEN_KEY, COOKIE_VK_TOKEN_KEY } from "../../constants";
import { AdaptivePanelHeader } from "../../helpers/adaptivePanelHeader";
import { useStoreUpdater } from "../../store/updater";

type AuthCallbackProps = {
  setAuthorized: (value: boolean) => void;
};

const cookies = new Cookies();

export const AuthCallback = (props: AuthCallbackProps) => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const { setAuthorized } = props;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, whoAmI, initializeStores] = useStoreUpdater();

  const saveToken = useCallback((vkToken: string, apiToken: string) => {
    const cookieExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    cookies.set(COOKIE_API_TOKEN_KEY, apiToken, {
      expires: cookieExpires,
      secure: true,
    });
    cookies.set(COOKIE_VK_TOKEN_KEY, vkToken, {
      expires: cookieExpires,
      secure: true,
    });
  }, []);

  const fetchToken = useCallback(async (code: string) => {
    const data = await NngApi.authInVk(code);
    const vkToken = data["vk_token"] as string;
    const apiToken = data["token"] as string;

    return [vkToken, apiToken];
  }, []);

  const updateStores = useCallback(
    async (vkToken: string, apiToken: string) => {
      const currentUserId: number = await whoAmI(apiToken);

      if (currentUserId === -1) {
        setAuthorized(false);
        return;
      }

      initializeStores(vkToken, apiToken, currentUserId);
      setAuthorized(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const updateAll = useCallback(async () => {
    const code = searchParams.get("code");
    if (code == null) {
      setSuccess(false);
      return;
    }

    try {
      const [vkToken, apiToken] = await fetchToken(code);
      saveToken(vkToken, apiToken);
      await updateStores(vkToken, apiToken);
      setSuccess(true);
    } catch (error) {
      console.log("error while updateAll", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateAll().then(() => {
      setLoading(false);
    });
  }, [updateAll]);

  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        <Group header={<Header mode="secondary">Авторизация</Header>}>
          {loading && <ScreenSpinner size={"large"} />}
          {success && !loading && (
            <Placeholder
              icon={<Icon56CheckCircleOutline />}
              action={
                <Button size={"l"} onClick={() => navigate("/")}>
                  Вернуться назад
                </Button>
              }
            >
              Успешно!
            </Placeholder>
          )}
          {!success && !loading && (
            <Placeholder icon={<Icon56GlobeCrossOutline />}>
              Не удалось сохранить токен
            </Placeholder>
          )}
        </Group>
      </Panel>
    </View>
  );
};
