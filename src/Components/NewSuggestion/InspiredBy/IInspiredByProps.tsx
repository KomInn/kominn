import { Suggestion } from "../../../Models";
export interface IInspiredByProps {
    onDataUpdate?(inspiredBy: Suggestion[]): void;
}
