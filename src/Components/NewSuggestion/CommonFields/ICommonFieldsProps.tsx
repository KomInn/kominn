import { Suggestion } from "../../../Models";
export interface ICommonFieldsProps {
    onSuggestionUpdate?(suggestion: Suggestion): void;
    validationMode: boolean;
}
