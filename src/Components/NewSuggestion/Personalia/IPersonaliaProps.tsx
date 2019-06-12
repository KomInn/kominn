import { Person } from "../../Common/Person";
export interface IPersonaliaProps {
    onDataUpdate?(person: Person): void;
    validationMode?: boolean;
}
