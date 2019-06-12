import { Suggestion } from "../../Common/Suggestion";
export interface ICommentsProps {
    suggestion: Suggestion;
    onCommentSubmitted(): void;
}
