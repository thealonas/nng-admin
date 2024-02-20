import {
  Icon28CheckCircleOutline,
  Icon28ErrorCircleOutline,
} from "@vkontakte/icons";
import {
  Alert,
  Avatar,
  Group,
  InfoRow,
  Placeholder,
  SimpleCell,
  Snackbar,
  Switch,
} from "@vkontakte/vkui";
import { useEffect, useState } from "react";
import { User } from "../../../api/categories/usersCategory";
import { useNngApiStore } from "../../../store/apiStore";
import { VkGroup } from "../../../vk/models/vkGroup";

type UserGroupProps = {
  userNngData: User | undefined;
  groupsData: VkGroup[];
  setPopout: (popout: JSX.Element | null) => void;
};

export const UserGroups = (props: UserGroupProps) => {
  const apiStore = useNngApiStore();

  const [snackBar, setSnackBar] = useState<React.JSX.Element | null>(null);

  const [groupSwitches, setGroupSwitches] = useState<Record<number, boolean>>(
    {}
  );

  const openErrorSnackBar = () => {
    setSnackBar(
      <Snackbar
        onClose={() => setSnackBar(null)}
        before={
          <Icon28ErrorCircleOutline fill="var(--vkui--color_icon_negative)" />
        }
      >
        Не удалось выполнить операцию
      </Snackbar>
    );
  };

  const openSuccessSnackBar = () => {
    setSnackBar(
      <Snackbar
        onClose={() => setSnackBar(null)}
        before={
          <Icon28CheckCircleOutline fill="var(--vkui--color_icon_positive)" />
        }
      >
        Успешно!
      </Snackbar>
    );
  };

  const fireEditor = async (groupId: number) => {
    try {
      await apiStore.nngApi.users.fireEditor(
        props.userNngData?.userId ?? 0,
        groupId
      );
    } catch (e) {
      console.log(e);
      openErrorSnackBar();
      return;
    }

    setGroupSwitches((prev) => {
      const newGroupSwitches = { ...prev };
      newGroupSwitches[groupId] = false;
      return newGroupSwitches;
    });
    openSuccessSnackBar();
  };

  const restoreEditor = async (groupId: number) => {
    try {
      await apiStore.nngApi.users.restoreEditor(
        props.userNngData?.userId ?? 0,
        groupId
      );
    } catch (e) {
      console.log(e);
      openErrorSnackBar();
      return;
    }

    setGroupSwitches((prev) => {
      const newGroupSwitches = { ...prev };
      newGroupSwitches[groupId] = true;
      return newGroupSwitches;
    });
    openSuccessSnackBar();
  };

  const popoutConfirm = (groupId: number, newState: boolean) => {
    const target = props.groupsData.find((group) => group.id === groupId);

    if (target == null) {
      throw new Error("Group not found");
    }

    const heading = newState ? "Выдача редактора" : "Снятие редактора";
    const confirmButton = newState ? "Выдать" : "Снять";
    const message = newState
      ? `Ты уверен, что хочешь выдать редактора пользователю ${props.userNngData?.name} в группе @${target?.screenName}?`
      : `Ты уверен, что хочешь снять редактора у пользователя ${props.userNngData?.name} в группе @${target?.screenName}?`;

    return (
      <Alert
        actions={[
          {
            title: confirmButton,
            mode: "destructive",

            action: () => {
              newState ? restoreEditor(groupId) : fireEditor(groupId);
            },
          },
          {
            title: "Отмена",
            mode: "cancel",
            action: () => {},
          },
        ]}
        actionsLayout="horizontal"
        onClose={() => props.setPopout(null)}
        header={heading}
        text={message}
      ></Alert>
    );
  };

  useEffect(() => {
    const userGroups = props.userNngData?.groups ?? [];
    const groupIds = userGroups.map((group) => group);

    const newGroupSwitches: Record<number, boolean> = {};
    for (const groupId of groupIds) {
      newGroupSwitches[groupId] = true;
    }

    setGroupSwitches(newGroupSwitches);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openConfirmationPopout = (groupId: number) => {
    const newState = !groupSwitches[groupId];
    props.setPopout(popoutConfirm(groupId, newState));
  };

  const groupCell = (groupId: number) => {
    const target = props.groupsData.find((group) => group.id === groupId);
    if (target == null) {
      throw new Error("Group not found");
    }

    return (
      <SimpleCell
        key={target.id}
        before={<Avatar src={target.photo200} />}
        onClick={() => openConfirmationPopout(groupId)}
        after={
          <Switch
            checked={groupSwitches[groupId] ?? true}
            onChange={() => openConfirmationPopout(groupId)}
          />
        }
      >
        <InfoRow header={target.name}>@{target.screenName}</InfoRow>
      </SimpleCell>
    );
  };

  const userGroups = props.userNngData?.groups ?? [];

  const groups = () => {
    if (userGroups.length === 0) {
      return (
        <Group key="elements" mode="plain">
          <Placeholder>Пользователь не состоит в группах</Placeholder>
        </Group>
      );
    }

    return (
      <Group key="elements" mode="plain">
        {userGroups.map((groupId) => groupCell(groupId))}
        {snackBar}
      </Group>
    );
  };

  return groups();
};
