import { SustainabilityGoal } from "../../Common/SustainabilityGoal";
export interface ISustainabilityGoalsProps {
    onDataUpdate?(goals: Array<SustainabilityGoal>): void;
}
