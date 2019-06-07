import * as React from "react";
import { Row, Col, FormGroup, FormControl, HelpBlock, ControlLabel, Checkbox } from "react-bootstrap";
import { Person } from "../Common/Person";
import { DataAdapter } from "../Common/DataAdapter";
import { SustainabilityGoal } from "../Common/SustainabilityGoal";

// TODO: Implement validation
interface Props { onDataUpdate?(goals: Array<SustainabilityGoal>): void }
interface State { Goals: Array<SustainabilityGoal>, SelectedGoals: Array<SustainabilityGoal> }

export class SustainabilityGoals extends React.Component<Props, State>
{
    state = { SelectedGoals: new Array<SustainabilityGoal>(), Goals: new Array<SustainabilityGoal>() };

    componentWillMount() {
        var da = new DataAdapter();
        da.getSustainabilityGoals().then((results: Array<SustainabilityGoal>) => {
            this.setState({ Goals: results });
        });
    }

    toggleGoal(goal: SustainabilityGoal) {
        var selectedGoals = this.state.SelectedGoals;
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

        this.setState({ SelectedGoals: selectedGoals }, () => {
            this.props.onDataUpdate(this.state.SelectedGoals);
        });
    }

    render() {
        return (
            <Row>
                <Col xs={12}>
                    <label htmlFor="inspirasjon">Bærekraftsmål</label>
                    <FormGroup>
                        {this.state.Goals.map((goal: SustainabilityGoal) => {
                            return <span><Checkbox onClick={() => this.toggleGoal(goal)}>{goal.Title}</Checkbox></span>
                        })}
                    </FormGroup>
                </Col>
            </Row>
        )
    }
}