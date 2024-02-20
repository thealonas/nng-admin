import { Icon28RefreshOutline } from "@vkontakte/icons";
import {
  Avatar,
  Button,
  Group,
  Header,
  Panel,
  Placeholder,
  RichCell,
  View
} from "@vkontakte/vkui";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Request, RequestType } from "../../api/categories/requestsCategory";
import { AdaptivePanelHeader } from "../../helpers/adaptivePanelHeader";
import { useNngApiStore } from "../../store/apiStore";
import { useVkStore } from "../../store/vkStore";
import { VkUser } from "../../vk/models/vkUser";

export const RequestsOverview = () => {
  const navigate = useNavigate();

  const apiStore = useNngApiStore();
  const vkStore = useVkStore();

  const [fetching, setFetching] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<VkUser[]>([]);

  const fetchRequests = useCallback(async () => {
    const allRequests = await apiStore.nngApi.requests.listRequests();
    setRequests(allRequests);
    return allRequests;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRequests]);

  const fetchUsers = useCallback(
    async (allRequests: Request[]) => {
      const allUsers: number[] = allRequests.map((request) => {
        return request.userId;
      });

      setUsers(await vkStore.vkApi.getUsersInfo(allUsers));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setUsers]
  );

  const fetchAll = useCallback(async () => {
    const allRequests = await fetchRequests();
    await fetchUsers(allRequests);
  }, [fetchRequests, fetchUsers]);

  useEffect(() => {
    setFetching(true);
    fetchAll().then(() => {
      setFetching(false);
    });
  }, [fetchAll]);

  const updateButton = (
    <Button
      mode={"link"}
      size={"s"}
      loading={fetching}
      onClick={() => {
        setRequests([]);
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

  const goToRequest = (requestId: number) => {
    navigate(`/requests/${requestId}`);
  };

  const requestCell = (request: Request) => {
    const user = users.find((user) => user.id === request.userId);
    let avatar = <Avatar />;
    let name = `id${request.userId}`;
    if (user) {
      avatar = <Avatar src={user.photo200} />;
      name = `${user.firstName} ${user.lastName}`;
    }

    const subhead =
      request.requestType === RequestType.unblock
        ? "Запрос на разблокировку"
        : "Жалоба";
    const caption = request.createdOn.toLocaleDateString("ru-RU");

    return (
      <RichCell
        key={request.requestId}
        subhead={subhead}
        caption={caption}
        before={avatar}
        after={`№${request.requestId}`}
        onClick={() => goToRequest(request.requestId)}
      >
        {name}
      </RichCell>
    );
  };

  const requestsItems = () => {
    return requests.map((request) => {
      return requestCell(request);
    });
  };

  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        <Group header={<Header aside={updateButton}>Запросы</Header>}>
          {fetching ? (
            <Placeholder>Загрузка…</Placeholder>
          ) : requests.length > 0 && users.length > 0 ? (
            requestsItems()
          ) : (
            <Placeholder>Все запросы рассмотрены 🙌</Placeholder>
          )}
        </Group>
      </Panel>
    </View>
  );
};
