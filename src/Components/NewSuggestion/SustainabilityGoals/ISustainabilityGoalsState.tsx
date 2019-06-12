import { SustainabilityGoal } from "../../Common/SustainabilityGoal";
export interface ISustainabilityGoalsState {
    goals: Array<SustainabilityGoal>;
    selectedGoals: Array<SustainabilityGoal>;
}
