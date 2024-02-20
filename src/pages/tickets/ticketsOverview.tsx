import { Icon28RefreshOutline } from "@vkontakte/icons";
import {
  Avatar,
  Badge,
  Button,
  Group,
  Header,
  Panel,
  Placeholder,
  RichCell,
  Spinner,
  View,
} from "@vkontakte/vkui";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TicketShort,
  TicketStatus,
  TicketType,
} from "../../api/categories/ticketsCategory";
import { AdaptivePanelHeader } from "../../helpers/adaptivePanelHeader";
import { useNngApiStore } from "../../store/apiStore";
import { useVkStore } from "../../store/vkStore";
import { VkUser } from "../../vk/models/vkUser";

export const TicketsOverview = () => {
  const navigate = useNavigate();

  const apiStore = useNngApiStore();
  const vkStore = useVkStore();

  const [fetching, setFetching] = useState(false);
  const [tickets, setTickets] = useState<TicketShort[]>([]);
  const [users, setUsers] = useState<VkUser[]>([]);

  const fetchTickets = useCallback(async () => {
    const tickets = await apiStore.nngApi.tickets.getTickets();
    setTickets(tickets);
    return tickets;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTickets]);

  const fetchUsers = useCallback(
    async (tickets: TicketShort[]) => {
      const users: number[] = tickets.map((ticket) => {
        return ticket.issuer;
      });

      const uniqueUsers = Array.from(new Set(users));
      setUsers(await vkStore.vkApi.getUsersInfo(uniqueUsers));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setUsers]
  );

  const fetchAll = useCallback(async () => {
    const localTickets = await fetchTickets();
    await fetchUsers(localTickets);
  }, [fetchTickets, fetchUsers]);

  const updateButton = (
    <Button
      mode={"link"}
      size={"s"}
      loading={fetching}
      onClick={() => {
        setTickets([]);
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

  useEffect(() => {
    setFetching(true);
    fetchAll().then(() => {
      setFetching(false);
    });
  }, [fetchAll]);

  const goToTicket = (ticketId: number) => {
    navigate(`/tickets/${ticketId}`);
  };

  const ticketCell = (ticket: TicketShort) => {
    const user = users.find((user) => user.id === ticket.issuer);
    return (
      <RichCell
        key={ticket.ticketId}
        afterCaption={
          ticket.status === TicketStatus.inReview
            ? "На рассмотрении"
            : "Ожидает рассмотрения"
        }
        text={
          <>
            {ticket.topic}{" "}
            {ticket.needsAttention ? (
              <Badge
                mode="new"
                style={{
                  display: "inline-block",
                  color: "var(--vkui--color_icon_accent)",
                }}
              />
            ) : undefined}
          </>
        }
        before={<Avatar src={user?.photo200} />}
        after={
          ticket.type === TicketType.question
            ? `Тикет №${ticket.ticketId}`
            : `Предложение №${ticket.ticketId}`
        }
        onClick={() => {
          goToTicket(ticket.ticketId);
        }}
      >
        {user?.firstName} {user?.lastName}
      </RichCell>
    );
  };

  const ticketList = () => {
    return tickets.map(ticketCell);
  };

  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        <Group header={<Header aside={updateButton}>Тикеты</Header>}>
          {fetching ? (
            <Placeholder>
              <Spinner />
            </Placeholder>
          ) : tickets.length === 0 ? (
            <Placeholder>Все тикеты рассмотрены 🙌</Placeholder>
          ) : (
            ticketList()
          )}
        </Group>
      </Panel>
    </View>
  );
};
