import { SustainabilityGoal } from "../../../Models";

export interface ISustainabilityGoalsProps {
    onDataUpdate?(goals: Array<SustainabilityGoal>): void;
}
