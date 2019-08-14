import { InspiredByView } from "./InspiredByView";
import { Suggestion } from "../../../Models";

export interface IInspiredByState {
    suggestions?: Suggestion[];
    selectedView?: InspiredByView;
}
