import {
  Icon28ArrowLeftOutline,
  Icon28CheckCircleOutline,
  Icon28RefreshOutline,
  Icon36GhostSimpleOutline,
} from "@vkontakte/icons";
import {
  Alert,
  Avatar,
  Button,
  Group,
  Header,
  IconButton,
  InfoRow,
  Panel,
  Placeholder,
  RichCell,
  Separator,
  SimpleCell,
  Spinner,
  View,
  WriteBar,
  WriteBarIcon,
} from "@vkontakte/vkui";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Ticket,
  TicketMessage,
  TicketStatus,
  TicketType,
} from "../../api/categories/ticketsCategory";
import { User } from "../../api/categories/usersCategory";
import { AdaptivePanelHeader } from "../../helpers/adaptivePanelHeader";
import { useNngApiStore } from "../../store/apiStore";
import { useVkStore } from "../../store/vkStore";
import { VkUser } from "../../vk/models/vkUser";

export const TicketPage = () => {
  const { id } = useParams();

  const [popout, setPopout] = useState<React.JSX.Element>();

  const navigate = useNavigate();

  const apiStore = useNngApiStore();
  const vkStore = useVkStore();

  const [ticket, setTicket] = useState<Ticket>();
  const [userVk, setUserVk] = useState<VkUser>();
  const [userApi, setUserApi] = useState<User>();

  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(false);

  const [inputValue, setInputValue] = useState("");

  const scrollMessages = (): void => {
    const element = document.getElementById("messages-container");
    if (element != null) {
      element.scrollTop = element.scrollHeight;
    }
  };

  const fetchTicket = useCallback(async () => {
    if (id == null) {
      throw new Error("No ticket id provided");
    }

    const localTicket = await apiStore.nngApi.tickets.getTicket(parseInt(id));
    setTicket(localTicket);
    return localTicket;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTicket]);

  const fetchUser = useCallback(
    async (localTicket: Ticket) => {
      setUserVk((await vkStore.vkApi.getUsersInfo([localTicket.issuer]))[0]);
      setUserApi(await apiStore.nngApi.users.getUser(localTicket.issuer));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setUserVk, setUserApi]
  );

  const fetchAll = useCallback(async () => {
    const localTicket = await fetchTicket();
    await fetchUser(localTicket);
  }, [fetchTicket, fetchUser]);

  useEffect(() => {
    setFetching(true);
    fetchAll()
      .then(() => {
        setFetching(false);
        setTimeout(() => {
          scrollMessages();
        }, 100);
      })
      .catch((error) => {
        console.log(error);
        setFetching(false);
        setError(true);
      });
  }, [fetchAll]);

  const placeholder = (children: any) => {
    return (
      <Group>
        <Placeholder>{children}</Placeholder>
      </Group>
    );
  };

  const goBack = () => {
    navigate(-1);
  };

  const goToUser = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const userCell = (userId: number) => {
    if (!userApi || !userVk) {
      return undefined;
    }

    return (
      <SimpleCell
        before={<Avatar src={userVk.photo200} />}
        onClick={() => goToUser(userId)}
        expandable="auto"
      >
        <InfoRow header={"Автор тикета"}>{userApi.name}</InfoRow>
      </SimpleCell>
    );
  };

  const messageCell = (message: TicketMessage, index: number) => {
    const textNode = (
      <>
        {message.messageText}
        <br />
        {message.attachments.map((attachment, index) => {
          return (
            <div key={`attachment-${message.added.toISOString()}-${index}`}>
              <a href={`${attachment}`} target="_blank" rel="noreferrer">
                Вложение №{index + 1}
              </a>
              <br />
            </div>
          );
        })}
      </>
    );

    const avatar: any = message.authorAdmin ? (
      <Avatar>
        <Icon36GhostSimpleOutline />
      </Avatar>
    ) : (
      <Avatar src={userVk?.photo200} />
    );

    const name = message.authorAdmin ? "Администратор" : userApi?.name;

    return (
      <div
        style={{
          display: "flex",
        }}
        key={`message-${message.added.toISOString()}-${index}`}
      >
        <RichCell
          style={{
            whiteSpace: "pre-line",
          }}
          multiline
          disabled
          key={index}
          before={avatar}
          text={textNode}
        >
          {name}{" "}
          <object
            style={{
              color: "var(--vkui--color_text_secondary)",
            }}
          >
            {message.added.toLocaleString("ru-RU")}
          </object>
        </RichCell>
      </div>
    );
  };

  const closeTicket = async (silent: boolean = false) => {
    if (ticket == null) {
      return;
    }

    await apiStore.nngApi.tickets.updateStatus(
      ticket?.ticketId,
      TicketStatus.closed,
      silent
    );

    setFetching(true);
    try {
      await fetchTicket();
      setTimeout(() => {
        scrollMessages();
      }, 100);
    } catch (error) {
      console.log(error);
      setError(true);
      setFetching(false);
    }
    setFetching(false);
  };

  const sendMessage = async () => {
    const targetInput = inputValue.trim();
    if (targetInput === "" || ticket == null) {
      return;
    }

    const ticketCopy = ticket;

    const newMessage = new TicketMessage();

    newMessage.added = new Date();
    newMessage.authorAdmin = true;
    newMessage.attachments = [];
    newMessage.messageText = targetInput;

    ticketCopy.dialog.push(newMessage);

    setTicket(ticketCopy);
    setInputValue("");
    setTimeout(() => scrollMessages(), 100);

    await apiStore.nngApi.tickets.addMessage(
      ticket.ticketId,
      targetInput,
      true
    );
  };

  const dialogBlock = () => {
    return (
      <Group header={<Header>Диалог</Header>}>
        <div
          id={"messages-container"}
          key={"messages"}
          style={{
            height: "calc(100vh - 500px)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {ticket?.dialog.map((message, index) => {
            return messageCell(message, index);
          })}
        </div>
        <div key={"send"}>
          <Separator wide />
          <WriteBar
            disabled={ticket?.status === TicketStatus.closed}
            after={
              <WriteBarIcon
                disabled={ticket?.status === TicketStatus.closed}
                mode="send"
                onClick={() => {
                  sendMessage().then();
                }}
              />
            }
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.currentTarget.value);
            }}
            placeholder="Сообщение"
            onKeyDown={(e) => {
              if (
                e.ctrlKey &&
                e.key === "Enter" &&
                ticket?.status !== TicketStatus.closed
              ) {
                sendMessage().then();
              }
            }}
          />
        </div>
      </Group>
    );
  };

  const openTicketCloseConfirm = () => {
    setPopout(
      <Alert
        actions={[
          {
            title: "Закрыть",
            mode: "destructive",
            action: () => closeTicket()
          },
          {
            title: "Закрыть тихо",
            mode: "default",
            action: () => closeTicket(true)
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
        text="Вы уверены, что хотите закрыть тикет?"
      />
    );
  };

  const updateButton = (
    <Button
      mode={"link"}
      size={"s"}
      loading={fetching}
      onClick={() => {
        setFetching(true);
        fetchAll()
          .then(() => {
            setFetching(false);
            setTimeout(() => {
              scrollMessages();
            }, 100);
          })
          .catch((error) => {
            console.log(error);
            setError(true);
          });
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

  const ticketElement = () => {
    return (
      <>
        <Group
          header={
            <Header aside={updateButton}>
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
                {ticket?.type === TicketType.question ? "Тикет" : "Предложение"}{" "}
                №{ticket?.ticketId}
              </div>
            </Header>
          }
        >
          {ticket?.issuer && userCell(ticket?.issuer)}
          <SimpleCell>
            <InfoRow header="Текущий статус">
              {ticket?.status === TicketStatus.unreviewed
                ? "Не рассмотенный"
                : ticket?.status === TicketStatus.inReview
                  ? "На рассмотрении"
                  : "Рассмотрен"}
            </InfoRow>
          </SimpleCell>
          {ticket?.status !== TicketStatus.closed ? (
            <SimpleCell
              before={<Icon28CheckCircleOutline />}
              onClick={openTicketCloseConfirm}
            >
              Закрыть тикет
            </SimpleCell>
          ) : undefined}
        </Group>
        {dialogBlock()}
      </>
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
            : ticketElement()}

        {popout}
      </Panel>
    </View>
  );
};
