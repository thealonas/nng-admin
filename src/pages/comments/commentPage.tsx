import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNngApiStore } from "../../store/apiStore";
import { useVkStore } from "../../store/vkStore";
import { VkGroup } from "../../vk/models/vkGroup";
import { VkUser } from "../../vk/models/vkUser";
import { Comment } from "../../api/categories/commentsCategory";
import {
  Avatar,
  FormItem,
  Gallery,
  Group,
  Header,
  IconButton,
  InfoRow,
  Panel,
  Placeholder,
  Progress,
  SimpleCell,
  Spinner,
  View,
} from "@vkontakte/vkui";
import { AdaptivePanelHeader } from "../../helpers/adaptivePanelHeader";
import { Icon28ArrowLeftOutline, Icon28LogoVk } from "@vkontakte/icons";
import { User } from "../../api/categories/usersCategory";

export const CommentPage = () => {
  const navigate = useNavigate();

  const { id } = useParams();
  const commentId = parseInt(id ?? "-1");

  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(false);

  const [commentData, setCommentData] = useState<Comment>();
  const [toxicity, setToxicity] = useState(0);

  const [groupData, setGroupData] = useState<VkGroup>();

  const [authorDataVk, setAuthorDataVk] = useState<VkUser>();
  const [authorDataApi, setAuthorDataApi] = useState<User>();

  const apiStore = useNngApiStore();
  const vkStore = useVkStore();

  const toxicityAppereance =
    toxicity <= 30 ? "positive" : toxicity <= 60 ? undefined : "negative";

  const toxicityName =
    toxicity <= 30
      ? "Низкая"
      : toxicity <= 60
        ? "Средняя"
        : toxicity <= 80
          ? "Высокая"
          : "🤬";

  const safeFetch = async <Type,>(
    lambda: () => Promise<Type>
  ): Promise<Type | undefined> => {
    try {
      return await lambda();
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const fetchUser = useCallback(
    async (comment: Comment) => {
      const userApi = await safeFetch(
        async () => await apiStore.nngApi.users.getUser(comment.authorId)
      );
      setAuthorDataApi(userApi);

      const userVk = ((await safeFetch(
        async () => await vkStore.vkApi.getUsersInfo([comment.authorId])
      )) ?? [undefined])[0];
      setAuthorDataVk(userVk);
    },
    [setAuthorDataApi, setAuthorDataVk, apiStore.nngApi.users, vkStore.vkApi]
  );

  const fetchAll = useCallback(async () => {
    const comment = await safeFetch(
      async () => await apiStore.nngApi.comments.getComment(commentId)
    );

    if (comment == null) {
      setError(true);
      return;
    }

    setToxicity(comment.toxicity * 100);

    setCommentData(comment);

    const group = ((await safeFetch(
      async () => await vkStore.vkApi.getGroupsInfo([comment.groupId])
    )) ?? [undefined])[0];

    setGroupData(group);

    await fetchUser(comment);
  }, [
    fetchUser,
    setCommentData,
    setGroupData,
    apiStore.nngApi.comments,
    commentId,
    vkStore.vkApi,
  ]);

  useEffect(() => {
    setFetching(true);
    fetchAll()
      .then(() => {
        setFetching(false);
      })
      .catch((e) => {
        setFetching(true);
        setError(true);
        console.error(e);
      });
  }, [fetchAll]);

  const goBack = () => {
    navigate(-1);
  };

  const goToUser = () => {
    const userId =
      authorDataApi != null ? authorDataApi.userId : authorDataVk?.id;
    navigate(`/users/${userId}`);
  };

  const header = (
    <Header
      aside={
        <IconButton
          href={commentData != null ? commentData.fullUrl() : ""}
          target="_blank"
        >
          <Icon28LogoVk />
        </IconButton>
      }
    >
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
        {commentData != null ? `Комментарий №${commentId}` : "🤷‍♂️"}
      </div>
    </Header>
  );

  const infoSection = (
    <>
      <SimpleCell
        onClick={goToUser}
        before={<Avatar src={authorDataVk?.photo200}></Avatar>}
      >
        <InfoRow header="Автор комментария">
          {authorDataApi?.name ??
            `${authorDataVk?.firstName} ${authorDataVk?.lastName}`}
        </InfoRow>
      </SimpleCell>
      <SimpleCell
        before={<Avatar src={groupData?.photo200} />}
        href={`https://vk.ru/club${groupData?.id}`}
        target="_blank"
      >
        <InfoRow header="Использованная группа">
          @{groupData?.screenName}
        </InfoRow>
      </SimpleCell>
    </>
  );

  const attachmentsToImg = () => {
    if (
      commentData?.attachments == null ||
      commentData.attachments.length === 0
    ) {
      return [];
    }

    return commentData.attachments.map((attachment, index) => {
      return (
        <img
          src={attachment}
          key={`img-${index}`}
          alt={`Приложение №${index + 1}`}
          style={{
            maxWidth: 200,
            maxHeight: 200,
          }}
        ></img>
      );
    });
  };

  const contentSection = (
    <>
      <SimpleCell multiline>
        <InfoRow header={"Текст комментария"}>
          {commentData?.text ?? "Отсутствует"}
        </InfoRow>
      </SimpleCell>

      <FormItem
        top="Токсичность"
        bottom={`${toxicityName} (${toxicity.toFixed(0)})`}
        topComponent="h5"
      >
        <Progress value={toxicity} appearance={toxicityAppereance} />
      </FormItem>

      {commentData?.attachments && commentData.attachments.length > 0 ? (
        <SimpleCell disabled>
          <InfoRow header="Вложения">
            <Gallery
              style={{
                maxWidth: 200,
                maxHeight: 200,
              }}
              align="center"
              bullets="dark"
            >
              {attachmentsToImg()}
            </Gallery>
          </InfoRow>
        </SimpleCell>
      ) : (
        <SimpleCell>
          <InfoRow header="Вложения">Отсутствуют</InfoRow>
        </SimpleCell>
      )}
    </>
  );

  const page = () => {
    return (
      <>
        <Group header={header}>{infoSection}</Group>
        <Group>{contentSection}</Group>
      </>
    );
  };

  return (
    <View activePanel="main">
      <Panel id="main">
        <AdaptivePanelHeader />
        {error ? (
          <Group header={header}>
            <Placeholder>Произошла ошибка</Placeholder>
          </Group>
        ) : fetching ? (
          <Group header={header}>
            <Placeholder>
              <Spinner />
            </Placeholder>
          </Group>
        ) : (
          page()
        )}
      </Panel>
    </View>
  );
};
