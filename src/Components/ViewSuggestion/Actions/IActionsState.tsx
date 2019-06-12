import { Suggestion } from "../../Common/Suggestion";
export interface IActionsState {
	showModal: boolean;
	numLikes: number;
	inspiredBy: Suggestion;
	updatingLike?: boolean;
}
