import { Suggestion } from "../../../Models";
export interface ICommentsProps {
    suggestion: Suggestion;
    onCommentSubmitted(): void;
}
