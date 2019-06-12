import { Suggestion } from "../../Common/Suggestion";
export interface IInspiredByState {
    inspiredBy: Array<Suggestion>;
    suggestions: Array<Suggestion>;
    searchTerm?: string;
}
