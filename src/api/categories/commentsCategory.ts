import {
  Serializable,
  SnakeCaseNamingStrategy,
  jsonObject,
  jsonProperty,
} from "ts-serializable";
import { ApiCategory } from "./apiCategory";

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class Comment extends Serializable {
  @jsonProperty(Number)
  commentId: number = -1;

  @jsonProperty(Number)
  groupId: number = 0;

  @jsonProperty(Number)
  targetGroupId: number = 0;

  @jsonProperty(Number)
  authorId: number = 0;

  @jsonProperty(Number)
  postId: number = 0;

  @jsonProperty(Number)
  commentVkId: number = 0;

  @jsonProperty(Date)
  postedOn: Date = new Date();

  @jsonProperty(String, null)
  text: string | null = null;

  @jsonProperty([String])
  attachments: string[] = [];

  @jsonProperty(Number)
  toxicity: number = 0;

  fullUrl(): string {
    return `https://vk.ru/wall-${this.targetGroupId}_${this.postId}?reply=${this.commentVkId}`;
  }
}

export class CommentCategory extends ApiCategory {
  public async getUserComments(userId: number): Promise<Comment[]> {
    const comments = await this.get(`comments/user/${userId}`);
    const answer = [];
    for (const comment of comments) {
      answer.push(Comment.fromJSON(comment));
    }

    return answer;
  }

  public async getComment(commentId: number): Promise<Comment> {
    const comment = await this.get(`comments/comment/${commentId}`);
    return Comment.fromJSON(comment);
  }
}
