import { Suggestion } from "../../../Models";
export interface IInnovationOfTheMonthState {
	suggestions?: Suggestion[];
	show: boolean;
	inspiredBy: Suggestion;
}
