import { Suggestion } from "../../../Models";
export interface IActionsState {
	showModal: boolean;
	numLikes: number;
	inspiredBy: Suggestion;
	updatingLike?: boolean;
}
