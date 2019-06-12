import { Suggestion } from "../../Common/Suggestion";
export interface IInspiredByProps {
    onDataUpdate?(inspiredBy: Array<Suggestion>): void;
}
