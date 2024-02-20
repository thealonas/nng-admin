import { Icon12Crown, Icon12FireAlt } from "@vkontakte/icons";
import {
  Avatar,
  Group,
  Header,
  Panel,
  Placeholder,
  Search,
  SimpleCell,
  Spinner,
  View,
} from "@vkontakte/vkui";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../api/categories/usersCategory";
import { AdaptivePanelHeader } from "../../helpers/adaptivePanelHeader";
import { useDebouncedCallbackAsync } from "../../helpers/debounce";
import { useNngApiStore } from "../../store/apiStore";
import { userUsersSearchStore } from "../../store/users/usersSearchStore";
import { useVkStore } from "../../store/vkStore";
import { VkUser } from "../../vk/models/vkUser";

export const UsersPage = () => {
  const navigate = useNavigate();

  const apiStore = useNngApiStore();
  const vkStore = useVkStore();
  const searchStore = userUsersSearchStore();

  const [fetching, setFetching] = useState(false);

  const [localQuery, setLocalQuery] = useState("");
  const [localVkUsers, setLocalVkUsers] = useState<VkUser[]>([]);
  const [localApiUsers, setLocalApiUsers] = useState<User[]>([]);

  const fetchAndUpdateResults = useCallback(async (query: string) => {
    const apiUsers = await apiStore.nngApi.users.searchUsers(query);
    const apiUsersIds = apiUsers.map((user) => user.userId);
    const vkUsers = await vkStore.vkApi.getUsersInfo(apiUsersIds);

    setLocalVkUsers(vkUsers);
    setLocalApiUsers(apiUsers);

    searchStore.setUserSearch(query);
    searchStore.setOverviewVkUsers(vkUsers);
    searchStore.setOverviewApiUsers(apiUsers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { debouncedFunction, clearDebounce } = useDebouncedCallbackAsync(
    fetchAndUpdateResults,
    500,
    () => {
      setFetching(false);
    }
  );

  const updateQuery = useCallback(
    async (query: string) => {
      if (localQuery === query) {
        return;
      }

      setLocalQuery(query);
      setLocalVkUsers([]);
      setLocalApiUsers([]);
      if (query === "") {
        searchStore.setOverviewApiUsers([]);
        searchStore.setOverviewVkUsers([]);
        searchStore.setUserSearch(query);
        return;
      }

      setFetching(true);
      debouncedFunction(query);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [localQuery]
  );

  useEffect(() => {
    if (
      searchStore.overviewVkUsers.length < 1 ||
      searchStore.overviewApiUsers.length < 1
    ) {
      setFetching(false);
      return;
    }

    setLocalVkUsers(searchStore.overviewVkUsers);
    setLocalApiUsers(searchStore.overviewApiUsers);
    setLocalQuery(searchStore.userSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearDebounce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearDebounce]);

  const getUserPhoto = (userId: number) => {
    return localVkUsers.find((user) => user.id === userId)?.photo200;
  };

  const goToUser = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const userCells = localApiUsers.map((user) => {
    return (
      <SimpleCell
        key={user.userId}
        expandable="auto"
        onClick={() => {
          goToUser(user.userId);
        }}
        badgeAfterTitle={
          user.admin ? (
            <Icon12Crown />
          ) : user.trustInfo.activism ? (
            <Icon12FireAlt />
          ) : undefined
        }
        before={<Avatar src={getUserPhoto(user.userId)} />}
      >
        {user.name}
      </SimpleCell>
    );
  });

  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        <Group header={<Header>Пользователи</Header>}>
          <Search
            style={{
              marginBottom: "10px",
            }}
            defaultValue={
              searchStore.userSearch !== "" ? searchStore.userSearch : undefined
            }
            onChange={async (e) => {
              await updateQuery(e.target.value);
            }}
          />
          {fetching ? (
            <Placeholder>
              <Spinner />
            </Placeholder>
          ) : localApiUsers.length < 1 || localVkUsers.length < 1 ? (
            localQuery === "" ? (
              <Placeholder>Начните вводить запрос</Placeholder>
            ) : (
              <Placeholder>Ничего не найдено</Placeholder>
            )
          ) : (
            userCells
          )}
        </Group>
      </Panel>
    </View>
  );
};
