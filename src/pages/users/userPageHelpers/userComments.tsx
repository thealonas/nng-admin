import { useNavigate } from "react-router-dom";
import { Comment } from "../../../api/categories/commentsCategory";
import { Group, InfoRow, Placeholder, SimpleCell } from "@vkontakte/vkui";

type UserCommentsProps = {
  userComments: Comment[];
};

export const UserComments = (props: UserCommentsProps) => {
  const navigate = useNavigate();

  const goToComment = (commentId: number) => {
    navigate(`/comments/${commentId}`);
  };

  const commentCell = (comment: Comment) => {
    let text = "Отсутствует";
    if (comment.text && comment.text.length > 0) {
      text = comment.text;
    }

    return (
      <SimpleCell
        key={comment.commentId}
        expandable="auto"
        onClick={() => {
          goToComment(comment.commentId);
        }}
      >
        <InfoRow header={`Комментарий №${comment.commentId}`}>{text}</InfoRow>
      </SimpleCell>
    );
  };

  if (props.userComments.length === 0) {
    return (
      <Group mode="plain">
        <Placeholder>Комментарии отсутствуют</Placeholder>
      </Group>
    );
  }

  return (
    <Group mode="plain" id="select-comments" key="select-comments">
      {props.userComments.map(commentCell)}
    </Group>
  );
};
