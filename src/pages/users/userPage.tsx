import {
  Icon12Crown,
  Icon12FireAlt,
  Icon28ArrowLeftOutline,
  Icon28Favorite,
  Icon28HandSlashOutline,
  Icon28LogoVk,
  Icon28Report,
  Icon28WalletOutline,
} from "@vkontakte/icons";
import {
  Alert,
  Group,
  Header,
  IconButton,
  Panel,
  Placeholder,
  SimpleCell,
  Spinner,
  Switch,
  View,
} from "@vkontakte/vkui";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, ViolationType } from "../../api/categories/usersCategory";
import { IdentityCard } from "../../components/identityCard";
import { InvalidDataError } from "../../components/invalidDataError";
import { AdaptivePanelHeader } from "../../helpers/adaptivePanelHeader";
import { useNngApiStore } from "../../store/apiStore";
import { useVkStore } from "../../store/vkStore";
import { VkUser } from "../../vk/models/vkUser";
import { UserAddViolation } from "./userPageHelpers/userAddViolation";
import { UserTrustFactor } from "./userPageHelpers/userTrustFactor";
import { UserViolations } from "./userPageHelpers/userViolations";
import { Comment } from "../../api/categories/commentsCategory";

type UserPageProps = {
  setPopout: (popout: JSX.Element | null) => void;
};

export const UserPage = (props: UserPageProps) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const userId = parseInt(id ?? "-1");

  const [popout, setPopout] = useState<React.JSX.Element>();

  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(false);

  const apiStore = useNngApiStore();
  const vkStore = useVkStore();

  const [userVkData, setUserVkData] = useState<VkUser>();
  const [userNngData, setUserNngData] = useState<User>();
  const [userComments, setUserComments] = useState<Comment[]>([]);

  const [activismCheck, setActivismCheck] = useState(false);
  const [donateCheck, setDonateCheck] = useState(false);

  const [violationFormActive, setViolationFormActive] = useState(false);

  const [trustFetching, setTrustFetching] = useState(false);

  const fetchUser = async (): Promise<[User, VkUser]> => {
    const apiData: User = await apiStore.nngApi.users.getUser(userId);
    const vkData: VkUser = (await vkStore.vkApi.getUsersInfo([userId]))[0];
    const comments: Comment[] =
      (await apiStore.nngApi.comments.getUserComments(userId)) ?? [];

    setUserNngData(apiData);
    setUserVkData(vkData);
    setUserComments(comments);

    return [apiData, vkData];
  };

  useEffect(() => {
    if (userId === -1) {
      setError(true);
      return;
    }

    setFetching(true);

    fetchUser()
      .then(([apiData, _]) => {
        setActivismCheck(apiData.trustInfo.activism ?? false);
        setDonateCheck(apiData.trustInfo.donate ?? false);
        setFetching(false);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
        setFetching(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titleBadge = userNngData?.admin ? (
    <Icon12Crown
      width={18}
      height={18}
      style={{
        marginLeft: 6,
        color: "var(--vkui--color_accent_blue)",
      }}
    />
  ) : userNngData?.trustInfo.activism ? (
    <Icon12FireAlt
      width={18}
      height={18}
      style={{
        marginLeft: 6,
        color: "var(--vkui--color_accent_blue)",
      }}
    />
  ) : undefined;

  const goBack = () => {
    navigate(-1);
  };

  const switchActivism = (newValue: boolean) => {
    setActivismCheck(newValue);
    setUserActivism(newValue).then(() => {});
  };

  const switchDonate = (newValue: boolean) => {
    setDonateCheck(newValue);
    setUserDonate(newValue).then(() => {});
  };

  const unbanUser = async () => {
    setTrustFetching(true);

    await apiStore.nngApi.users.unbanUser(userId);

    let actualUser = await apiStore.nngApi.users.getUser(userId); // первый раз получаем для обновы блокировок внизу
    setUserNngData(actualUser);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setUserNngData(await apiStore.nngApi.users.getUser(userId)); // и второй раз для обновление траста
    setTrustFetching(false);
  };

  const recalculateTrust = async () => {
    setTrustFetching(true);
    try {
      await apiStore.nngApi.users.calculateTrust(userId);
    } catch (error) {
      console.log(error);
      setTrustFetching(false);
      setError(true);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const actualUser = await apiStore.nngApi.users.getUser(userId);
    setUserNngData(actualUser);
    setTrustFetching(false);
  };

  const openUnbanAlert = () => {
    setPopout(
      <Alert
        actions={[
          {
            title: "Разблокировать",
            mode: "destructive",
            action: () => unbanUser()
          },
          {
            title: "Отмена",
            mode: "cancel"
          },
        ]}
        actionsLayout="vertical"
        onClose={() => {
          setPopout(undefined);
        }}
        header="Подтвердите действие"
        text="Вы уверены, что хотите закрыть разблокировать пользователя?"
      />
    );
  };

  const setUserActivism = async (newValue: boolean) => {
    setTrustFetching(true);
    let currentUser = await apiStore.nngApi.users.getUser(userId);

    currentUser.trustInfo.activism = newValue;
    setUserNngData(currentUser);

    await apiStore.nngApi.users.updateUser(currentUser);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    currentUser = await apiStore.nngApi.users.getUser(userId);
    setUserNngData(currentUser);
    setTrustFetching(false);
  };

  const setUserDonate = async (newValue: boolean) => {
    setTrustFetching(true);
    let currentUser = await apiStore.nngApi.users.getUser(userId);

    currentUser.trustInfo.donate = newValue;
    setUserNngData(currentUser);

    await apiStore.nngApi.users.updateUser(currentUser);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    currentUser = await apiStore.nngApi.users.getUser(userId);
    setUserNngData(currentUser);
    setTrustFetching(false);
  };

  const addViolation = async (user: User) => {
    setTrustFetching(true);
    setUserNngData(user);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setUserNngData(await apiStore.nngApi.users.getUser(userId));
    setTrustFetching(false);
  };

  const addViolationCell = (
    <SimpleCell
      before={<Icon28Report />}
      subtitle={"Откроется окно с заполнением данных"}
      onClick={() => {
        setViolationFormActive(true);
      }}
    >
      Добавить нарушение
    </SimpleCell>
  );

  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        <Group
          header={
            <Header
              aside={
                <IconButton
                  href={`https://vk.ru/id${userVkData?.id}`}
                  target="_blank"
                >
                  <Icon28LogoVk />
                </IconButton>
              }
            >
              <IconButton onClick={() => goBack()}>
                <Icon28ArrowLeftOutline />
              </IconButton>
            </Header>
          }
        >
          {fetching ? (
            <Placeholder>
              <Spinner />
            </Placeholder>
          ) : error ? (
            <InvalidDataError />
          ) : (
            <IdentityCard
              title={
                userNngData?.name ??
                `${userVkData?.firstName} ${userVkData?.lastName}`
              }
              avatar={userVkData?.photo200}
              titleBadge={titleBadge}
            ></IdentityCard>
          )}
        </Group>
        <Group header={<Header>Действия</Header>}>
          <SimpleCell
            before={<Icon28Favorite />}
            Component="label"
            after={
              <Switch
                checked={activismCheck}
                onChange={() => {
                  switchActivism(!activismCheck);
                }}
              />
            }
          >
            Благодарность
          </SimpleCell>

          <SimpleCell
            before={<Icon28WalletOutline />}
            Component="label"
            after={
              <Switch
                checked={donateCheck}
                onChange={() => {
                  switchDonate(!donateCheck);
                }}
              />
            }
          >
            Донат
          </SimpleCell>

          {!violationFormActive ? addViolationCell : undefined}

          {userNngData?.violations.some(
            (violation) =>
              violation.type === ViolationType.banned && violation.active
          ) ? (
            <SimpleCell
              before={<Icon28HandSlashOutline />}
              subtitle={
                "Все активные нарушения перестанут быть действительными"
              }
              onClick={() => {
                openUnbanAlert();
              }}
            >
              Амнистия
            </SimpleCell>
          ) : undefined}
        </Group>
        {violationFormActive ? (
          <UserAddViolation
            cancel={() => {
              setViolationFormActive(false);
            }}
            setUser={(user) => {
              addViolation(user).then(() => {});
            }}
            userId={userNngData?.userId ?? 0}
          />
        ) : undefined}
        <UserTrustFactor
          userNngData={userNngData}
          trustFetching={trustFetching}
          recalculateTrust={recalculateTrust}
        />
        <UserViolations
          userNngData={userNngData}
          setPopout={props.setPopout}
          fetching={fetching}
          userComments={userComments}
        />
        {popout}
      </Panel>
    </View>
  );
};
