import {
  Icon24ErrorCircle,
  Icon24Message,
  Icon24Users,
  Icon28ErrorCircleOutline,
  Icon28WarningTriangleOutline,
} from "@vkontakte/icons";
import {
  Accordion,
  Avatar,
  FormItem,
  Group,
  InfoRow,
  Placeholder,
  Separator,
  SimpleCell,
  Spacing,
  Spinner,
  SubnavigationBar,
  SubnavigationButton,
} from "@vkontakte/vkui";
import { useCallback, useEffect, useState } from "react";
import { Link, redirect } from "react-router-dom";
import {
  BanPriority,
  User,
  Violation,
  ViolationType,
} from "../../../api/categories/usersCategory";
import { useVkStore } from "../../../store/vkStore";
import { VkGroup } from "../../../vk/models/vkGroup";
import { VkUser } from "../../../vk/models/vkUser";
import { UserGroups } from "./userGroups";
import { Comment } from "../../../api/categories/commentsCategory";
import { UserComments } from "./userComments";

type UserViolationsAndGroupsProps = {
  userNngData: User | undefined;
  userComments: Comment[];
  setPopout: (popout: JSX.Element | null) => void;
  fetching: boolean;
};

export const UserViolations = (props: UserViolationsAndGroupsProps) => {
  const vkStore = useVkStore();

  const [violationsSelected, setViolationsSelected] = useState(true);
  const [groupsSelected, setGroupsSelected] = useState(false);
  const [commentsSelected, setCommentsSelected] = useState(false);

  const [groupsData, setGroupsData] = useState<VkGroup[]>([]);
  const [usersData, setUsersData] = useState<VkUser[]>([]);

  const selectViolations = () => {
    setGroupsSelected(false);
    setViolationsSelected(true);
    setCommentsSelected(false);
  };

  const selectGroups = () => {
    setGroupsSelected(true);
    setViolationsSelected(false);
    setCommentsSelected(false);
  };

  const selectComments = () => {
    setGroupsSelected(false);
    setViolationsSelected(false);
    setCommentsSelected(true);
  };

  const fetchGroups = useCallback(async () => {
    if (props.userNngData == null) {
      return;
    }

    const violationGroups = props.userNngData.violations
      .filter((violation) => violation.groupId != null)
      .map((val) => {
        if (val.groupId == null) {
          throw new Error("groupId is null");
        }

        return val.groupId;
      });

    const allGroups: number[] = [];

    allGroups.push(...violationGroups);
    allGroups.push(...props.userNngData.groups);

    const uniqueGroups = Array.from(new Set(allGroups));
    const groups = await vkStore.vkApi.getGroupsInfo(uniqueGroups);
    setGroupsData(groups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userNngData]);

  const goToUser = (userId: number) => {
    redirect(`/users/${userId}`);
  };

  const fetchUsers = useCallback(async () => {
    if (props.userNngData == null) {
      return;
    }

    const usersIds = props.userNngData.violations
      .filter((violation) => violation.complaint != null)
      .map((violation) => {
        if (violation.complaint == null) {
          throw new Error("complaint is null");
        }
        return violation.complaint;
      });

    const uniqueUsersIds = Array.from(new Set(usersIds));
    const users = await vkStore.vkApi.getUsersInfo(uniqueUsersIds);
    setUsersData(users);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userNngData]);

  useEffect(() => {
    fetchGroups().then(() => {
      fetchUsers().then();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userNngData]);

  const violationGroupCell = (groupId: number) => {
    const target = groupsData.find((group) => group.id === groupId);
    let element: React.JSX.Element;
    if (target) {
      element = (
        <SimpleCell
          before={<Avatar src={target.photo200} />}
          href={`https://vk.ru/club${target.id}`}
          target="_blank"
          expandable="auto"
        >
          <InfoRow header="Группа, в которой произошло нарушение">
            @{target.screenName}
          </InfoRow>
        </SimpleCell>
      );
    } else {
      element = (
        <SimpleCell
          before={<Avatar />}
          href={`https://vk.ru/club${groupId}`}
          target="_blank"
          expandable="auto"
        >
          <InfoRow header="Группа, в которой произошло нарушение">
            @club{groupId}
          </InfoRow>
        </SimpleCell>
      );
    }

    return element;
  };

  const userCell = (userId: number) => {
    const target = usersData.find((user) => user.id === userId);
    let element: React.JSX.Element;
    if (target) {
      element = (
        <Link
          to={`/users/${userId}`}
          style={{ textDecoration: "none" }}
          reloadDocument
        >
          <SimpleCell
            before={<Avatar src={target.photo200} />}
            onClick={() => goToUser(userId)}
            expandable="auto"
          >
            <InfoRow header={"Жалоба от"}>
              {target.firstName} {target.lastName}
            </InfoRow>
          </SimpleCell>
        </Link>
      );
    } else {
      element = (
        <FormItem top="Жалоба от" topComponent="h5">
          <SimpleCell
            before={<Avatar />}
            href={`https://vk.ru/id${userId}`}
            expandable="auto"
          >
            id{userId}
          </SimpleCell>
        </FormItem>
      );
    }

    return element;
  };

  const isViolationExpired = (violation: Violation) => {
    const isExpired = (date: Date | null) => {
      if (date == null) {
        return true;
      }

      const now = new Date();
      return now.getTime() - date.getTime() > 1000 * 3600 * 24 * 30;
    };

    const banExpired =
      violation.type === ViolationType.banned &&
      violation.active != null &&
      !violation.active;

    const warningExpired =
      violation.type === ViolationType.warned && isExpired(violation.date);

    return banExpired || warningExpired;
  };

  const violationGroup = (index: number, violation: Violation) => {
    return (
      <Group mode="plain" key={index}>
        {violation.type === ViolationType.banned ? (
          <SimpleCell before={<Icon28ErrorCircleOutline />} disabled>
            Блокировка
          </SimpleCell>
        ) : (
          <SimpleCell before={<Icon28WarningTriangleOutline />} disabled>
            Предупреждение
          </SimpleCell>
        )}
        <SimpleCell multiline>
          <InfoRow
            header={"Приоритет"}
            style={{
              color: Violation.priorityToColor(
                violation.priority ?? BanPriority.green,
              ),
            }}
          >
            {Violation.priorityToStringifiedReason(
              violation.priority ?? BanPriority.green,
            )}
          </InfoRow>
        </SimpleCell>

        {violation.groupId ? violationGroupCell(violation.groupId) : undefined}
        {violation.complaint ? userCell(violation.complaint) : undefined}
        {violation.date ? violationDate(violation.date) : undefined}
      </Group>
    );
  };

  const violationDate = (date: Date) => {
    let deltaDays =
      (new Date().getTime() - date.getTime()) / (1000 * 3600 * 24);

    deltaDays = Math.floor(deltaDays);

    let deltaString: string;

    if (deltaDays > 10 || deltaDays % 100 === 11) {
      deltaString = "дней назад";
    } else {
      const lastDigit = deltaDays % 10;

      if (lastDigit === 1) {
        deltaString = "день назад";
      } else if (lastDigit >= 2 && lastDigit <= 4) {
        deltaString = "дня назад";
      } else {
        deltaString = "дней назад";
      }
    }

    let formattedDate = `${date.toLocaleDateString("ru-RU")}`;

    if (deltaDays >= 1) {
      formattedDate += ` – ${deltaDays} ${deltaString}`;
    }

    return (
      <SimpleCell>
        <InfoRow header={"Дата нарушения"}>{formattedDate}</InfoRow>
      </SimpleCell>
    );
  };

  const userViolations = props.userNngData?.violations ?? [];

  const violations = () => {
    if (userViolations.length === 0) {
      return (
        <Group key="elements" mode="plain">
          <Placeholder>Нарушения отсутствуют 🎉</Placeholder>
        </Group>
      );
    }

    const activeViolationElements = userViolations
      .filter((violation) => !isViolationExpired(violation))
      .map((violation, index) => {
        return violationGroup(index, violation);
      });

    const inactiveViolationElements = userViolations
      .filter((violation) => isViolationExpired(violation))
      .map((violation, index) => {
        return violationGroup(index, violation);
      });

    return (
      <>
        {activeViolationElements}

        {inactiveViolationElements.length > 0 ? (
          <div>
            <Spacing size={12}>
              <Separator />
            </Spacing>
            <Accordion>
              <Accordion.Summary>Неактивные нарушения</Accordion.Summary>
              <Accordion.Content>{inactiveViolationElements}</Accordion.Content>
            </Accordion>
          </div>
        ) : undefined}
      </>
    );
  };

  const page = (
    <>
      <Group key={"navigation"} mode="plain">
        <SubnavigationBar mode="fixed">
          <SubnavigationButton
            before={<Icon24ErrorCircle />}
            selected={violationsSelected}
            onClick={selectViolations}
          >
            Нарушения
          </SubnavigationButton>
          <SubnavigationButton
            before={<Icon24Users />}
            selected={groupsSelected}
            onClick={selectGroups}
          >
            Группы
          </SubnavigationButton>
          <SubnavigationButton
            before={<Icon24Message />}
            selected={commentsSelected}
            onClick={selectComments}
          >
            Комментарии
          </SubnavigationButton>
        </SubnavigationBar>
      </Group>
      {violationsSelected ? violations() : null}
      {groupsSelected ? (
        <UserGroups
          groupsData={groupsData}
          setPopout={props.setPopout}
          userNngData={props.userNngData}
        />
      ) : null}
      {commentsSelected ? (
        <UserComments userComments={props.userComments} />
      ) : null}
    </>
  );

  return <Group>{props.fetching ? <Spinner /> : page}</Group>;
};
