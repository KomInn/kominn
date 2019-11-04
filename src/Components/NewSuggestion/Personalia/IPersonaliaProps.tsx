import { Person } from "../../../Models/Person";
export interface IPersonaliaProps {
    onDataUpdate?(person: Person): void;
    validationMode?: boolean;
}
