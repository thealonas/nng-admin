import { Icon28RefreshOutline } from "@vkontakte/icons";
import {
  Avatar,
  Button,
  Group,
  Header,
  InfoRow,
  Panel,
  Placeholder,
  SimpleCell,
  Spinner,
  View
} from "@vkontakte/vkui";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Violation } from "../../api/categories/usersCategory";
import { Watchdog } from "../../api/categories/watchdogCategory";
import { AdaptivePanelHeader } from "../../helpers/adaptivePanelHeader";
import { useNngApiStore } from "../../store/apiStore";
import { useVkStore } from "../../store/vkStore";
import { VkUser } from "../../vk/models/vkUser";

export const WatchdogOverview = () => {
  const navigate = useNavigate();

  const apiStore = useNngApiStore();
  const vkStore = useVkStore();

  const [fetching, setFetching] = useState(false);
  const [logs, setLogs] = useState<Watchdog[]>([]);
  const [users, setUsers] = useState<VkUser[]>([]);

  const fetchLogs = useCallback(async () => {
    const logs = await apiStore.nngApi.watchdog.getLogs();
    setLogs(logs);
    return logs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLogs]);

  const fetchUsers = useCallback(
    async (logsToFetch: Watchdog[]) => {
      const fetchArray: (number | null)[] = logsToFetch.map(
        (log) => log.intruder
      );
      const usersToFetch: number[] = fetchArray.filter(
        (id) => id != null
      ) as number[];

      usersToFetch.sort();
      const uniqueUsersToFetch = usersToFetch.filter(
        (id, index) => index === 0 || id !== usersToFetch[index - 1]
      );

      setUsers(await vkStore.vkApi.getUsersInfo(uniqueUsersToFetch));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setUsers]
  );

  const fetchAll = useCallback(async () => {
    const logs = await fetchLogs();
    await fetchUsers(logs);
  }, [fetchUsers, fetchLogs]);

  useEffect(() => {
    setFetching(true);
    fetchAll().then(() => {
      setFetching(false);
    });
  }, [fetchAll]);

  const goToLog = (logId: number) => {
    navigate(`/watchdog/${logId}`);
  };

  const updateButton = (
    <Button
      mode={"link"}
      size={"s"}
      loading={fetching}
      onClick={() => {
        setLogs([]);
        setFetching(true);
        setTimeout(() => {
          fetchAll().then(() => {
            setFetching(false);
          });
        }, 1000);
        return false;
      }}
    >
      <object
        style={{
          pointerEvents: "none",
        }}
      >
        <Icon28RefreshOutline />
      </object>
    </Button>
  );

  const logCell = (log: Watchdog) => {
    const targetUser = users.find((user) => user.id === log.intruder);
    return (
      <SimpleCell
        key={log.watchdogId}
        after={`Лог №${log.watchdogId}`}
        expandable="auto"
        onClick={() => {
          goToLog(log.watchdogId);
        }}
        before={
          <Avatar
            src={
              targetUser
                ? targetUser.photo200
                : "https://vk.ru/images/camera_200.png"
            }
          ></Avatar>
        }
      >
        <InfoRow
          header={`Приоритет: ${Violation.priorityToTitle(log.priority)}`}
        >
          {targetUser
            ? targetUser.firstName + " " + targetUser.lastName
            : log.intruder
            ? `id${log.intruder}`
            : `Пользователь отсутсвует`}
        </InfoRow>
      </SimpleCell>
    );
  };

  const logCells = () => {
    return logs.map((log) => {
      return logCell(log);
    });
  };

  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        <Group header={<Header aside={updateButton}>Вачдог</Header>}>
          {fetching ? (
            <Placeholder>
              <Spinner />
            </Placeholder>
          ) : logs.length === 0 ? (
            <Placeholder>Все логи рассмотрены 🙌</Placeholder>
          ) : (
            logCells()
          )}
        </Group>
      </Panel>
    </View>
  );
};
