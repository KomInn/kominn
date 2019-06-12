import * as React from "react"
import { Slider } from "office-ui-fabric-react/lib/Slider";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { Toggle } from "office-ui-fabric-react/lib/Toggle";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import { Suggestion } from "../../Common/Suggestion";


interface ISuggestionRatingState {
    ScoreFeasability: number,
    ScoreUserInvolvement: number,
    ScoreDistributionPotential: number,
    ScoreDegreeOfInnovation: number,
    MoreActors: boolean,
    LawRequirements: boolean,
    Saving: boolean,
    ShortComment: string,
    ExistingId: number,
    Saved: boolean,
    userHasPermissions: boolean
}

interface ISuggestionRatingProps {
    sugggestion: Suggestion
}

export class SuggestionRating extends React.Component<ISuggestionRatingProps, ISuggestionRatingState>
{
    constructor(props: ISuggestionRatingProps) {
        super(props);
        this.state = {
            ScoreFeasability: 5,
            ScoreUserInvolvement: 5,
            ScoreDistributionPotential: 5,
            ScoreDegreeOfInnovation: 5,
            MoreActors: false,
            LawRequirements: false,
            ShortComment: "",
            Saving: false,
            ExistingId: -1,
            Saved: false,
            userHasPermissions: false
        }
    }

    private deleteExisting() {
        return new Promise((resolve, reject) => {
            if (this.state.ExistingId === -1) {
                resolve();
                return;
            }
            var context = SP.ClientContext.get_current();
            var list = context.get_web().get_lists().getByTitle("Forslagsvurdering");
            var item = list.getItemById(this.state.ExistingId);
            item.deleteObject();
            context.executeQueryAsync(resolve, reject)
        });

    }

    @autobind
    private async save() {
        if (this.state.Saving)
            return;
        this.setState({ Saving: true, Saved: false });
        await this.deleteExisting();
        await this.submit();
        this.setState({ Saving: false, Saved: true });
    }

    private submit() {
        return new Promise((resolve, reject) => {
            var s = this.state;
            var context = SP.ClientContext.get_current();
            var list = context.get_web().get_lists().getByTitle("Forslagsvurdering");
            var itemcreationinfo = new SP.ListItemCreationInformation();
            var item = list.addItem(itemcreationinfo);
            item.set_item("Title", this.props.sugggestion.Title);
            item.set_item("KmiScoreFeasability", s.ScoreFeasability);
            item.set_item("KmiScoreUserInvolvement", s.ScoreUserInvolvement);
            item.set_item("KmiScoreDistributionPotential", s.ScoreDistributionPotential);
            item.set_item("KmiScoreDegreeOfInnovation", s.ScoreDegreeOfInnovation);
            item.set_item("KmiMoreActors", s.MoreActors);
            item.set_item("KmiLawRequirements", s.LawRequirements);
            item.set_item("KmiShortComment", s.ShortComment);
            var suggestionLookup = new SP.FieldLookupValue();
            suggestionLookup.set_lookupId(this.props.sugggestion.Id);
            item.set_item("KmiSuggestion", suggestionLookup);
            item.update();
            context.load(item);
            context.executeQueryAsync(
                () => {
                    this.setState({ ExistingId: item.get_id() });
                    resolve(s);
                },
                (_sender: any, error: any) => {
                    console.log(error.get_message());
                    reject(error.get_message());
                });
        });
    }


    checkPermissionsToList(): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Forslagsvurdering')/Items",
                contentType: "application/json;odata=verbose",
                success: () => resolve(true),
                error: () => resolve(false),
            })
        });
    }

    getExisting() {
        var exId = this.props.sugggestion.Id;
        var meId = _spPageContextInfo.userId;
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Forslagsvurdering')/Items?$select=*,KmiSuggestion/Id,Author/Id&$expand=KmiSuggestion,Author&$filter=KmiSuggestion/Id eq " + exId + " and Author/Id eq " + meId + "",
            contentType: "application/json;odata=verbose",
            success: (data: any) => {
                if (data.d.results.length === 0)
                    return;
                var [result] = data.d.results;
                this.setState({
                    LawRequirements: result.KmiLawRequirements,
                    MoreActors: result.KmiMoreActors,
                    ScoreDegreeOfInnovation: result.KmiScoreDegreeOfInnovation,
                    ScoreDistributionPotential: result.KmiScoreDistributionPotential,
                    ScoreFeasability: result.KmiScoreFeasability,
                    ScoreUserInvolvement: result.KmiScoreUserInvolvement,
                    ShortComment: result.KmiShortComment || '',
                    ExistingId: result.Id,
                });
            }
        });

    }

    componentWillMount() {
        this.checkPermissionsToList()
            .then((userHasPermissions: boolean) => {
                this.setState({ userHasPermissions });
                if (userHasPermissions) this.getExisting();
            });
    }

    render() {
        if (!this.state.userHasPermissions)
            return null;

        return (
            <div className="SuggestionRatingBox">
                <h3>Forslagsvurdering</h3>

                <Slider
                    label="Score gjennomførbarhet?"
                    max={10}
                    min={0}
                    value={this.state.ScoreFeasability}
                    onChange={newValue => this.setState({ ScoreFeasability: newValue })} />
                <Slider
                    label="Score bruker/innbyggerinvolvering?"
                    max={10}
                    min={0}
                    value={this.state.ScoreUserInvolvement}
                    onChange={newValue => this.setState({ ScoreUserInvolvement: newValue })} />
                <Slider
                    label="Score spredningspotensial"
                    max={10}
                    min={0}
                    value={this.state.ScoreDistributionPotential}
                    onChange={newValue => this.setState({ ScoreDistributionPotential: newValue })} />
                <Slider
                    label="Score innovasjonsgrad"
                    max={10}
                    min={0}
                    value={this.state.ScoreDegreeOfInnovation}
                    onChange={newValue => this.setState({ ScoreDegreeOfInnovation: newValue })} />
                <Toggle
                    label="Flere aktører?"
                    onText="Ja"
                    offText="Nei"
                    checked={this.state.MoreActors}
                    onChanged={newValue => this.setState({ MoreActors: newValue })} />
                <Toggle
                    label="Lovkrav?"
                    onText="Ja"
                    offText="Nei"
                    checked={this.state.LawRequirements}
                    onChanged={newValue => this.setState({ LawRequirements: newValue })} />
                <TextField
                    label="Kort kommentar"
                    multiline={true}
                    rows={5}
                    value={this.state.ShortComment}
                    onChanged={newValue => this.setState({ ShortComment: newValue })} />
                <div style={{ marginTop: 10 }}>
                    <DefaultButton text="Lagre forslagsvurdering" iconProps={{ iconName: "Save" }} onClick={this.save} disabled={this.state.Saving} />
                </div>
            </div>
        )
    }
}