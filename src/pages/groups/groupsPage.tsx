import { Icon28RefreshOutline } from "@vkontakte/icons";
import {
  Avatar,
  Button,
  Group,
  Header,
  Panel,
  Placeholder,
  RichCell,
  View,
} from "@vkontakte/vkui";
import { useCallback, useEffect, useState } from "react";
import { AdaptivePanelHeader } from "../../helpers/adaptivePanelHeader";
import { useNngApiStore } from "../../store/apiStore";
import {
  GroupStoreElement,
  useGroupStore,
} from "../../store/groups/groupStore";
import { useVkStore } from "../../store/vkStore";

export const GroupsPage = () => {
  const apiStore = useNngApiStore();
  const vkStore = useVkStore();
  const groupStore = useGroupStore();

  const [groups, setGroups] = useState<GroupStoreElement[]>([]);

  const [fetching, setFetching] = useState(false);

  const fetchVkGroupsMembers = useCallback(async (groups: number[]) => {
    return await vkStore.vkApi.getGroupsMembersCount(groups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVkGroups = useCallback(async (groups: number[]) => {
    return await vkStore.vkApi.getGroupsInfo(groups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNngGroups = useCallback(async () => {
    return await apiStore.nngApi.groups.getGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGroups = useCallback(async () => {
    if (groupStore.groups.length > 0) {
      setFetching(false);
      setGroups(groupStore.groups);
      return;
    }

    setFetching(true);
    const nngGroups = await fetchNngGroups();
    if (nngGroups.length === 0) {
      setFetching(false);
      return;
    }

    const allGroups = nngGroups.map((group) => group.groupId);
    const vkGroups = await fetchVkGroups(allGroups);

    const membersData = await fetchVkGroupsMembers(allGroups);

    const storeGroups = vkGroups.map((group) => {
      const memberData = membersData.find((obj) => {
        return obj.id === group.id;
      });

      if (!memberData) {
        throw new Error("Group not found");
      }

      return new GroupStoreElement(
        group.id,
        group.name,
        group.screenName,
        group.photo200,
        memberData
      );
    });

    groupStore.setGroups(storeGroups);
    setGroups(storeGroups);

    setFetching(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchGroups().then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateButton = (
    <Button
      mode={"link"}
      size={"s"}
      loading={fetching}
      onClick={() => {
        setGroups([]);
        groupStore.setGroups([]);
        setFetching(true);
        setTimeout(() => {
          fetchGroups().then(() => {});
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

  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        <Group header={<Header aside={updateButton}>Группы</Header>}>
          {groups &&
            groups.map((group) => (
              <RichCell
                href={`https://vk.ru/club${group.id}`}
                target="_blank"
                key={group.id}
                before={<Avatar src={group.photo_200}></Avatar>}
                text={group.name}
                caption={`@${group.screen_name}`}
                after={`Редакторы: ${group.membersCount.admins}`}
                afterCaption={`Подписчики: ${group.membersCount.members}`}
              ></RichCell>
            ))}
          {groups.length === 0 && !fetching && (
            <Placeholder>Группы отсутствуют 🥴</Placeholder>
          )}

          {fetching && <Placeholder>Загрузка…</Placeholder>}
        </Group>
      </Panel>
    </View>
  );
};
