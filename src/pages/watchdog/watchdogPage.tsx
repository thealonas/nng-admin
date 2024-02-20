import {
  Icon28ArrowLeftOutline,
  Icon28CheckCircleOutline,
  Icon28ErrorCircleOutline,
  Icon28WriteOutline,
} from "@vkontakte/icons";
import {
  Avatar,
  Button,
  ButtonGroup,
  FormItem,
  Group,
  Header,
  IconButton,
  InfoRow,
  Input,
  Panel,
  Placeholder,
  SimpleCell,
  Snackbar,
  Spinner,
  View,
} from "@vkontakte/vkui";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Group as NngGroup } from "../../api/categories/groupsCategory";
import { BanPriority, Violation } from "../../api/categories/usersCategory";
import { Watchdog } from "../../api/categories/watchdogCategory";
import { AdaptivePanelHeader } from "../../helpers/adaptivePanelHeader";
import { GroupsSelect } from "../../helpers/groupsSelect";
import { useNngApiStore } from "../../store/apiStore";
import { useVkStore } from "../../store/vkStore";
import { VkGroup } from "../../vk/models/vkGroup";
import { VkUser } from "../../vk/models/vkUser";

export const WatchdogPage = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const apiStore = useNngApiStore();
  const vkStore = useVkStore();

  const [error, setError] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [users, setUsers] = useState<VkUser[]>([]);

  const [group, setGroup] = useState<VkGroup>();
  const [groups, setGroups] = useState<NngGroup[]>([]);

  const [formOpened, setFormOpened] = useState(false);

  const [formIntruder, setFormIntruder] = useState("");
  const [snackbar, setSnackbar] = useState<React.JSX.Element | undefined>(
    undefined,
  );

  const formIntruderCorrect = () => {
    if (formIntruder === "") {
      return true;
    }

    return !isNaN(parseInt(formIntruder)) && parseInt(formIntruder) > 0;
  };

  const checkUser = async (userId: number): Promise<boolean> => {
    try {
      await apiStore.nngApi.users.getUser(userId);
    } catch (error) {
      console.log(error);
      return false;
    }

    return true;
  };

  const [formVictim, setFormVictim] = useState("");
  const formVictimCorrect = () => {
    if (formVictim === "") {
      return true;
    }

    return !isNaN(parseInt(formVictim));
  };

  const [formGroupId, setFormGroupId] = useState<number>();

  const [log, setLog] = useState<Watchdog>();

  const setDefaultFormValues = () => {
    setFormIntruder("");
    setFormVictim("");
    setFormGroupId(log?.groupId);
  };

  const fetchLog = useCallback(async () => {
    if (id == null) {
      throw new Error("No id provided");
    }

    const watchdogId = parseInt(id);
    const request = await apiStore.nngApi.watchdog.getLog(watchdogId);
    setLog(request);
    return request;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLog]);

  const fetchAllGroups = useCallback(async () => {
    setGroups(await apiStore.nngApi.groups.getGroups());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVk = useCallback(
    async (log: Watchdog) => {
      const usersToFetch = [];
      if (log.intruder) {
        usersToFetch.push(log.intruder);
      }

      if (log.victim) {
        usersToFetch.push(log.victim);
      }

      setUsers(await vkStore.vkApi.getUsersInfo(usersToFetch));
      setGroup((await vkStore.vkApi.getGroupsInfo([log.groupId]))[0]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setUsers],
  );

  const goBack = () => {
    navigate(-1);
  };

  const fetchAll = useCallback(async () => {
    const log = await fetchLog();
    await fetchVk(log);
    await fetchAllGroups();
    setDefaultFormValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchLog, fetchVk, fetchAllGroups]);

  useEffect(() => {
    setFetching(true);
    fetchAll()
      .then(() => {
        setFetching(false);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
        setFetching(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAll]);

  const goToUser = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const userCell = (userId: number, formName: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return (
        <SimpleCell
          before={<Avatar src="https://vk.ru/images/camera_200.png" />}
          href={`https://vk.ru/id${userId}`}
          target="_blank"
        >
          <InfoRow header={formName}>
            Пользователь отсутствует ({userId})
          </InfoRow>
        </SimpleCell>
      );
    }

    return (
      <SimpleCell
        before={<Avatar src={target.photo200} />}
        onClick={() => goToUser(userId)}
        expandable="auto"
      >
        <InfoRow header={formName}>
          {target.firstName} {target.lastName}
        </InfoRow>
      </SimpleCell>
    );
  };

  const priorityCell = (priority: BanPriority) => {
    return (
      <SimpleCell>
        <InfoRow
          header={"Приоритет"}
          style={{
            color: Violation.priorityToColor(priority),
          }}
        >
          {Violation.priorityToStringifiedReason(priority)}
        </InfoRow>
      </SimpleCell>
    );
  };

  const markAsReviewed = async () => {
    if (log == null) {
      return;
    }

    await apiStore.nngApi.watchdog.addInfo(
      log.watchdogId,
      null,
      null,
      null,
      null,
      true,
    );

    await fetchAll();
  };

  const saveAdditionalData = async () => {
    if (!formIntruderCorrect() || !formVictimCorrect() || log == null) {
      return;
    }

    const newIntruder = parseInt(formIntruder);
    const newVictim = parseInt(formVictim);

    if (formIntruder !== "" && !(await checkUser(newIntruder))) {
      setInvalidUserSnackbar("Нарушитель отсутсвует в БД");
      return;
    }

    if (formVictim !== "" && !(await checkUser(newVictim))) {
      setInvalidUserSnackbar("Потерпевший отсутсвует в БД");
      return;
    }

    setFormOpened(false);

    await apiStore.nngApi.watchdog.addInfo(
      log.watchdogId,
      formIntruder === "" ? null : parseInt(formIntruder),
      formGroupId === log.groupId || formGroupId == null ? null : formGroupId,
      formVictim === "" ? null : parseInt(formVictim),
      null,
      null,
    );

    await fetchAll();
  };

  const setInvalidUserSnackbar = (errorText: string) => {
    setSnackbar(
      <Snackbar
        layout="vertical"
        onClose={() => setSnackbar(undefined)}
        before={
          <Icon28ErrorCircleOutline fill="var(--vkui--color_icon_negative)" />
        }
      >
        {errorText}
      </Snackbar>,
    );
  };

  const groupCell = () => {
    if (!group) {
      return undefined;
    }

    return (
      <SimpleCell
        before={<Avatar src={group.photo200} />}
        href={`https://vk.ru/club${group.id}`}
        target="_blank"
        expandable="auto"
      >
        <InfoRow header="Группа из события">@{group.screenName}</InfoRow>
      </SimpleCell>
    );
  };

  const actionGroup = () => {
    if (log?.reviewed) {
      return (
        <Group>
          <SimpleCell before={<Icon28CheckCircleOutline />}>
            Данный лог уже был рассмотрен
          </SimpleCell>
        </Group>
      );
    }

    return (
      <Group header={<Header>Действия</Header>}>
        {formOpened ? (
          <form>
            <FormItem
              top={"Группа, в которой произошло нарушение"}
              topComponent="h5"
            >
              <GroupsSelect
                allGroups={groups}
                setGroup={setFormGroupId}
                placeholder={`Не менять (@${group?.screenName})`}
              />
            </FormItem>
            <FormItem
              top={"Айди нарушителя"}
              status={formIntruderCorrect() ? "default" : "error"}
              topComponent="h5"
            >
              <Input
                value={formIntruder}
                placeholder={
                  log?.intruder
                    ? `Не менять (${log.intruder})`
                    : `Оставить пустым`
                }
                onChange={(e) => {
                  setFormIntruder(e.target.value);
                }}
              />
            </FormItem>
            <FormItem
              top={"Айди потерпевшего"}
              status={formVictimCorrect() ? "default" : "error"}
              topComponent="h5"
            >
              <Input
                value={formVictim}
                onChange={(e) => {
                  setFormVictim(e.target.value);
                }}
                placeholder={
                  log?.victim ? `Не менять (${log.victim})` : `Оставить пустым`
                }
              />
            </FormItem>
            <FormItem>
              <ButtonGroup mode="horizontal" stretched gap="m">
                <Button
                  size="l"
                  stretched
                  appearance="negative"
                  mode="secondary"
                  onClick={() => {
                    setFormOpened(false);
                    setDefaultFormValues();
                  }}
                >
                  Отмена
                </Button>
                <Button
                  size="l"
                  stretched
                  appearance="positive"
                  mode="secondary"
                  disabled={!formIntruderCorrect() || !formVictimCorrect()}
                  onClick={() => {
                    saveAdditionalData();
                  }}
                >
                  Сохранить
                </Button>
              </ButtonGroup>
            </FormItem>
          </form>
        ) : (
          <SimpleCell
            before={<Icon28WriteOutline />}
            onClick={() => {
              setFormOpened(true);
            }}
          >
            Дополнить лог
          </SimpleCell>
        )}

        <SimpleCell
          before={<Icon28CheckCircleOutline />}
          onClick={() => {
            markAsReviewed().then(() => {});
          }}
        >
          Отметить как рассмотренный
        </SimpleCell>
      </Group>
    );
  };

  const overviewGroup = () => {
    return (
      <Group
        header={
          <Header>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <IconButton
                onClick={() => goBack()}
                style={{
                  marginRight: "10px",
                }}
              >
                <Icon28ArrowLeftOutline />
              </IconButton>
              {log != null ? `Лог №${log?.watchdogId}` : "🤷‍♂️"}
            </div>
          </Header>
        }
      >
        {groupCell()}
        {log?.intruder ? userCell(log.intruder, "Нарушитель") : undefined}
        {log?.priority ? priorityCell(log.priority) : undefined}
        {log?.victim ? userCell(log.victim, "Потерпевший") : undefined}
      </Group>
    );
  };

  const watchdogElement = () => {
    return (
      <>
        {overviewGroup()}
        {actionGroup()}
      </>
    );
  };

  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        {error ? (
          <Group>
            <Placeholder>Ошибка</Placeholder>
          </Group>
        ) : fetching ? (
          <Group>
            <Placeholder>
              <Spinner />
            </Placeholder>
          </Group>
        ) : (
          watchdogElement()
        )}
        {snackbar}
      </Panel>
    </View>
  );
};
