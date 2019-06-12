import * as React from "react";
import { DataAdapter } from "../../Common/DataAdapter";
import { SustainabilityGoal } from "../../Common/SustainabilityGoal";
import { Toggle } from "office-ui-fabric-react/lib/Toggle";
import { Label } from "office-ui-fabric-react/lib/Label";
import { ISustainabilityGoalsState } from "./ISustainabilityGoalsState";
import { ISustainabilityGoalsProps } from "./ISustainabilityGoalsProps";

export class SustainabilityGoals extends React.Component<ISustainabilityGoalsProps, ISustainabilityGoalsState>
{
    private dataAdapter = new DataAdapter();

    constructor(props: ISustainabilityGoalsProps) {
        super(props);
        this.state = { selectedGoals: [], goals: [] };
    }

    componentWillMount() {
        this.dataAdapter.getSustainabilityGoals().then((goals: Array<SustainabilityGoal>) => {
            this.setState({ goals });
        });
    }

    toggleGoal(goal: SustainabilityGoal) {
        var { selectedGoals } = { ...this.state } as ISustainabilityGoalsState;
        var id = -1;
        for (var i = 0; i < selectedGoals.length; i++) {
            if (selectedGoals[i].Id === goal.Id)
                id = i;
        }

        if (id !== -1) {
            selectedGoals.splice(id, 1);
        } else {
            selectedGoals.push(goal);
        }

        this.setState({ selectedGoals });
        this.props.onDataUpdate(selectedGoals);
    }

    render() {
        return (
            <>
                <Label>Bærekraftsmål</Label>
                {this.state.goals.map((goal: SustainabilityGoal, idx: number) => <Toggle key={idx} label={goal.Title} onChange={() => this.toggleGoal(goal)} />)}
            </>
        )
    }
}