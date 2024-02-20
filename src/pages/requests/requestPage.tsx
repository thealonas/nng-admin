import {
  Icon12Crown,
  Icon12FireAlt,
  Icon28ArrowLeftOutline,
  Icon28CheckCircleOutline,
  Icon28CrossLargeOutline,
  Icon28ErrorCircleOutline,
  Icon28WarningTriangleOutline,
  Icon28Write,
} from "@vkontakte/icons";
import {
  Avatar,
  Banner,
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
  Textarea,
  View,
  Link as VkLink,
} from "@vkontakte/vkui";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Request, RequestType } from "../../api/categories/requestsCategory";
import {
  BanPriority,
  User,
  Violation,
  ViolationType,
} from "../../api/categories/usersCategory";
import { AdaptivePanelHeader } from "../../helpers/adaptivePanelHeader";
import { useNngApiStore } from "../../store/apiStore";
import { useVkStore } from "../../store/vkStore";
import { VkGroup } from "../../vk/models/vkGroup";
import { VkUser } from "../../vk/models/vkUser";

export const RequestPage = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const apiStore = useNngApiStore();
  const vkStore = useVkStore();

  const [request, setRequest] = useState<Request>();
  const [error, setError] = useState<boolean>();
  const [fetching, setFetching] = useState<boolean>();

  const [userVk, setUserVk] = useState<VkUser>();
  const [user, setUser] = useState<User>();
  const [intruderVk, setIntruderVk] = useState<VkUser | null>(null);
  const [intruder, setIntruder] = useState<User | null>(null);
  const [violation, setViolation] = useState<Violation | null>(null);
  const [violationGroup, setViolationGroup] = useState<VkGroup | null>(null);
  const [violationUser, setViolationUser] = useState<VkUser | null>(null);

  const [answerInput, setAnswerInput] = useState("");

  const [missingIntruderInput, setMissingIntruderInput] = useState("");
  const [snackbar, setSnackbar] = useState<React.JSX.Element | undefined>(
    undefined
  );

  const fetchRequest = useCallback(async () => {
    try {
      const request = await apiStore.nngApi.requests.getRequest(
        parseInt(id ?? "")
      );
      setRequest(request);
      return request;
    } catch (e) {
      console.log(e);
      throw e;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRequest]);

  const fetchUsers = useCallback(
    async (request: Request) => {
      const localUser = await apiStore.nngApi.users.getUser(request.userId);
      setUser(localUser);

      const usersToFetch = [request.userId];
      if (request.intruder != null) {
        usersToFetch.push(request.intruder);
        setIntruder(await apiStore.nngApi.users.getUser(request.intruder));
      }

      const users = await vkStore.vkApi.getUsersInfo(usersToFetch);
      setUserVk(users[0]);

      if (request.intruder) {
        setIntruderVk(users[1]);
      }

      if (localUser.violations && localUser.violations.length >= 1) {
        const activeViolations = localUser.violations.filter((violation) => {
          return violation.type === ViolationType.banned && violation.active;
        });

        if (!activeViolations || activeViolations?.length < 1) {
          return undefined;
        }

        const localViolation = activeViolations[0];
        setViolation(localViolation);

        if (localViolation.groupId) {
          setViolationGroup(
            (await vkStore.vkApi.getGroupsInfo([localViolation.groupId]))[0]
          );
        }

        if (localViolation.complaint) {
          setViolationUser(
            (await vkStore.vkApi.getUsersInfo([localViolation.complaint]))[0]
          );
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      setUser,
      setIntruder,
      setUserVk,
      setIntruderVk,
      setViolation,
      setViolationGroup,
      setViolationUser,
    ]
  );

  const setIntruderInvalidSnackbar = () => {
    setSnackbar(
      <Snackbar
        layout="vertical"
        onClose={() => setSnackbar(undefined)}
        before={
          <Icon28ErrorCircleOutline fill="var(--vkui--color_icon_negative)" />
        }
      >
        Пользователь отсутсвует в БД
      </Snackbar>
    );
  };

  const fetchAll = useCallback(async () => {
    const localRequest = await fetchRequest();
    await fetchUsers(localRequest);
  }, [fetchRequest, fetchUsers]);

  useEffect(() => {
    setFetching(true);
    fetchAll()
      .then(() => {
        setFetching(false);
      })
      .catch(() => {
        setFetching(false);
        setError(true);
      });
  }, [fetchAll]);

  const goBack = () => {
    navigate(-1);
  };

  const complaintBlock = () => {
    if (
      request?.requestType !== RequestType.complaint ||
      !intruder ||
      !intruderVk
    ) {
      return undefined;
    }

    return (
      <Group header={<Header>Сведения по жалобе</Header>}>
        {intruderVk && intruder && (
          <SimpleCell
            badgeAfterTitle={
              intruder?.admin ? (
                <Icon12Crown />
              ) : intruder?.trustInfo.activism ? (
                <Icon12FireAlt />
              ) : undefined
            }
            expandable={"auto"}
            subtitle={"Подозреваемый"}
            onClick={() => {
              goToUser(intruderVk.id);
            }}
            before={<Avatar src={intruderVk?.photo200} />}
          >
            {intruderVk?.firstName} {intruderVk?.lastName}
          </SimpleCell>
        )}
        {request?.vkComment && (
          <SimpleCell multiline href={request.vkComment} target="_blank">
            <InfoRow header={"Комментарий"}>{request?.vkComment}</InfoRow>
          </SimpleCell>
        )}
      </Group>
    );
  };

  const violationGroupCell = () => {
    if (!violationGroup) {
      return undefined;
    }

    return (
      <SimpleCell
        before={<Avatar src={violationGroup.photo200} />}
        href={`https://vk.ru/club${violationGroup.id}`}
        target="_blank"
        expandable="auto"
      >
        <InfoRow header="Группа, в которой произошло нарушение">
          @{violationGroup.screenName}
        </InfoRow>
      </SimpleCell>
    );
  };

  const violationDate = (date: Date) => {
    let deltaDays =
      (new Date().getTime() - date.getTime()) / (1000 * 3600 * 24);

    deltaDays = Math.floor(deltaDays);

    let deltaString: string;
    const lastTwoDigits = deltaDays % 100;

    if (
      deltaDays > 10 ||
      lastTwoDigits === 11 ||
      lastTwoDigits === 12 ||
      lastTwoDigits === 13
    ) {
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

    let formatedDate = `${date.toLocaleDateString("ru-RU")}`;

    if (deltaDays >= 1) {
      formatedDate += ` – ${deltaDays} ${deltaString}`;
    }

    return (
      <SimpleCell>
        <InfoRow header={"Дата нарушения"}>{formatedDate}</InfoRow>
      </SimpleCell>
    );
  };

  const goToUser = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const userCell = (userId: number) => {
    if (!violationUser) {
      return undefined;
    }

    return (
      <SimpleCell
        before={<Avatar src={violationUser.photo200} />}
        onClick={() => goToUser(userId)}
        expandable="auto"
      >
        <InfoRow header={"Жалоба от"}>
          {violationUser.firstName} {violationUser.lastName}
        </InfoRow>
      </SimpleCell>
    );
  };

  const violationBlock = () => {
    if (
      request?.requestType !== RequestType.unblock ||
      !violation ||
      !violationUser
    ) {
      return undefined;
    }

    const unbanned =
      violation.type === ViolationType.banned &&
      violation.active != null &&
      !violation.active;

    return (
      <Group key="group" header={<Header>Активная блокировка</Header>}>
        <SimpleCell multiline>
          <InfoRow
            header={"Приоритет"}
            style={{
              color: !unbanned
                ? Violation.priorityToColor(
                    violation.priority ?? BanPriority.green
                  )
                : undefined,
              textDecoration: unbanned ? "line-through" : undefined,
            }}
          >
            {Violation.priorityToStringifiedReason(
              violation.priority ?? BanPriority.green
            )}
          </InfoRow>
        </SimpleCell>

        {violationGroupCell()}
        {violation.complaint ? userCell(violation.complaint) : undefined}
        {violation.date ? violationDate(violation.date) : undefined}
      </Group>
    );
  };

  const setRequestStatus = async (status: boolean) => {
    if (request == null) {
      throw new Error("Request is null");
    }

    await apiStore.nngApi.requests.changeRequestStatus(
      request.requestId,
      status,
      true,
      answerInput.length > 1 ? answerInput : undefined
    );

    setFetching(true);
    try {
      await fetchAll();
    } catch (e) {
      setError(true);
    }
    setFetching(false);
  };

  const templateButtons = () => {
    return (
      <ButtonGroup stretched>
        <Button
          size="m"
          mode="tertiary"
          stretched
          appearance="accent"
          onClick={() => {
            setAnswerInput("Шаблон 1");
          }}
        >
          Шаблон №1
        </Button>
        <Button
          size="m"
          mode="tertiary"
          stretched
          appearance="accent"
          onClick={() => {
            setAnswerInput("Шаблон 2");
          }}
        >
          Шаблон №2
        </Button>
        <Button
          size="m"
          mode="tertiary"
          stretched
          appearance="accent"
          onClick={() => {
            setAnswerInput("Шаблон 3");
          }}
        >
          Шаблон №3
        </Button>
      </ButtonGroup>
    );
  };

  const complaintActionBlock = () => {
    return (
      <Group>
        <form>
          <FormItem top="Ответ" topComponent="h5">
            <Textarea
              value={answerInput}
              onChange={(e) => {
                setAnswerInput(e.target.value);
              }}
            />
          </FormItem>
          <FormItem>{templateButtons()}</FormItem>
          <FormItem>
            <ButtonGroup stretched>
              <Button
                stretched
                size="l"
                appearance="negative"
                mode="secondary"
                onClick={() => {
                  setRequestStatus(false).then();
                }}
              >
                Отклонить
              </Button>
              <Button
                stretched
                size="l"
                appearance="positive"
                mode="secondary"
                disabled={request?.intruder == null}
                onClick={() => {
                  setRequestStatus(true).then();
                }}
              >
                Забанить
              </Button>
            </ButtonGroup>
          </FormItem>
        </form>
      </Group>
    );
  };

  const unblockActionBlock = () => {
    return (
      <Group>
        <form>
          <FormItem top="Ответ" topComponent="h5">
            <Textarea
              value={answerInput}
              onChange={(e) => {
                setAnswerInput(e.target.value);
              }}
            />
          </FormItem>
          <FormItem>{templateButtons()}</FormItem>
          <FormItem>
            <ButtonGroup stretched>
              <Button
                stretched
                size="l"
                appearance="negative"
                mode="secondary"
                onClick={() => {
                  setRequestStatus(false).then();
                }}
              >
                Отклонить
              </Button>
              <Button
                stretched
                size="l"
                appearance="positive"
                mode="secondary"
                onClick={() => {
                  setRequestStatus(true).then();
                }}
              >
                Разбанить
              </Button>
            </ButtonGroup>
          </FormItem>
        </form>
      </Group>
    );
  };

  const changeIntruderBlock = () => {
    const updateIntruder = async () => {
      if (request == null) {
        throw new Error("Request is null");
      }

      try {
        await apiStore.nngApi.requests.changeIntruder(
          request.requestId,
          parseInt(missingIntruderInput)
        );
      } catch (e) {
        console.log(e);
        setIntruderInvalidSnackbar();
        return;
      }

      setFetching(true);

      try {
        await fetchAll();
      } catch (e) {
        setFetching(false);
        setError(true);
      }
      setFetching(false);
    };

    if (
      request?.requestType !== RequestType.complaint ||
      request?.intruder != null ||
      request.answered
    ) {
      return undefined;
    }

    return (
      <Group>
        <Banner
          before={<Icon28WarningTriangleOutline />}
          header="У данной жалобы отсутствует нарушитель!"
          subheader={
            <Fragment>
              Чтобы продолжить, необходимо вручную{" "}
              <VkLink href={request.vkComment ?? undefined} target="_blank">
                перейти к комментарию
              </VkLink>{" "}
              и ввести айди нарушителя ниже
            </Fragment>
          }
        />
        <form>
          <FormItem top="Айди автора комментария" topComponent="h5">
            <Input
              value={missingIntruderInput}
              onChange={(e) => setMissingIntruderInput(e.target.value)}
            />
          </FormItem>
          <FormItem>
            <ButtonGroup stretched>
              <Button
                size="m"
                disabled={
                  missingIntruderInput.length < 1 ||
                  isNaN(parseInt(missingIntruderInput)) ||
                  parseInt(missingIntruderInput) <= 0
                }
                stretched
                appearance="positive"
                mode="secondary"
                onClick={() => {
                  updateIntruder().then();
                }}
              >
                Сохранить нарушителя
              </Button>
            </ButtonGroup>
          </FormItem>
        </form>
      </Group>
    );
  };

  const actionBlock = () => {
    if (request?.answered) {
      return (
        <Group>
          <SimpleCell disabled before={<Icon28Write />}>
            Этот запрос был помечен как отвеченный
          </SimpleCell>
          {request.answer && (
            <SimpleCell multiline>
              <InfoRow header={"Ваш ответ:"}>{request.answer}</InfoRow>
            </SimpleCell>
          )}
          {request.decision ? (
            <SimpleCell disabled before={<Icon28CheckCircleOutline />}>
              Решение положительное
            </SimpleCell>
          ) : (
            <SimpleCell disabled before={<Icon28CrossLargeOutline />}>
              Решение отрицательное
            </SimpleCell>
          )}
        </Group>
      );
    }

    if (request?.requestType === RequestType.complaint) {
      return complaintActionBlock();
    } else if (request?.requestType === RequestType.unblock) {
      return unblockActionBlock();
    }
  };

  const requestPage = (
    <>
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
              {request?.requestType === RequestType.complaint
                ? "Жалоба"
                : "Запрос на разблоикровку"}{" "}
              №{request?.requestId}
            </div>
          </Header>
        }
      >
        <SimpleCell
          badgeAfterTitle={
            user?.admin ? (
              <Icon12Crown />
            ) : user?.trustInfo.activism ? (
              <Icon12FireAlt />
            ) : undefined
          }
          expandable={"auto"}
          subtitle={"Автор"}
          onClick={() => goToUser(user?.userId ?? 0)}
          before={<Avatar src={userVk?.photo200} />}
        >
          {userVk?.firstName} {userVk?.lastName}
        </SimpleCell>
        {request?.userMessage && (
          <SimpleCell multiline>
            <InfoRow header={"Сообщение пользователя"}>
              {request.userMessage}
            </InfoRow>
          </SimpleCell>
        )}
        <SimpleCell>
          <InfoRow header={"Дата подачи"}>
            {request?.createdOn.toLocaleDateString("ru-RU")}
          </InfoRow>
        </SimpleCell>
      </Group>
      {changeIntruderBlock()}
      {complaintBlock()}
      {violationBlock()}
      {actionBlock()}
    </>
  );

  const placeholder = (text: any) => {
    return (
      <Group>
        <Placeholder>{text}</Placeholder>
      </Group>
    );
  };

  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        {fetching
          ? placeholder(<Spinner />)
          : error
            ? placeholder("Ошибка")
            : requestPage}
        {snackbar}
      </Panel>
    </View>
  );
};
