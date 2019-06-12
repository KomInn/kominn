import { Suggestion } from "../../Common/Suggestion";
export interface ICommonFieldsProps {
    onSuggestionUpdate?(suggestion: Suggestion): void;
    validationMode: boolean;
}
