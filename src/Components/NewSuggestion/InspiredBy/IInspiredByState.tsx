import { Suggestion } from "../../../Models";
export interface IInspiredByState {
    inspiredBy: Suggestion[];
    suggestions: Suggestion[];
    searchTerm?: string;
}
