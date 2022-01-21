import * as React from "react";
import { Person } from "../../../Models/Person";
import { DataAdapter } from "../../../Data/DataAdapter";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { PersonaliaFields } from "./PersonaliaFields";
import { IPersonaliaState } from "./IPersonaliaState";
import { IPersonaliaProps } from "./IPersonaliaProps";

export class Personalia extends React.Component<IPersonaliaProps, IPersonaliaState>
{
    private dataAdapter = new DataAdapter();

    constructor(props: IPersonaliaProps) {
        super(props);
        this.state = { profile: new Person() };
    }

    async componentWillMount() {
        let profile = await this.dataAdapter.getMyUserProfile();
        this.setState({ profile });
        this.update(profile);
    }

    private update(data = this.state.profile) {
        this.props.onDataUpdate(data);
    }

    private updateField(newValue: string, key: string) {
        var { profile } = { ...this.state } as IPersonaliaState;
        profile[key] = newValue;
        this.update(profile);
        this.setState({ profile });
    }

    render() {
        return (
            <section>
                <TextField
                    label="Navn"
                    required={true}
                    defaultValue={this.state.profile.Name}
                    onChange={(_event, newValue) => { this.updateField(newValue, "Name") }} />
                <TextField
                    label="E-post"
                    defaultValue={this.state.profile.MailAddress}
                    onChange={(_event, newValue) => { this.updateField(newValue, "MailAddress") }} />
                <TextField
                    label="Telefon"
                    defaultValue={this.state.profile.Telephone}
                    onChange={(_event, newValue) => { this.updateField(newValue, "Telephone") }} />
            </section>
        )
    }
}