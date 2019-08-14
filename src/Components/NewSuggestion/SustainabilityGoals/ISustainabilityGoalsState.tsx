import { SustainabilityGoal } from "../../../Models";

export interface ISustainabilityGoalsState {
    goals: Array<SustainabilityGoal>;
    selectedGoals: Array<SustainabilityGoal>;
}
