import { SustainabilityGoal } from "../../../Models";

export interface ISustainabilityGoalsProps {
    showTitle?: boolean;
    style?: React.CSSProperties;
    goals: SustainabilityGoal[];
}
