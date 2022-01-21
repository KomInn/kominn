import * as React from "react";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { Campaign } from "../../Models/Campaign";
import * as moment from "moment"
import * as _ from "lodash";
import { DataAdapter } from "../../Data/DataAdapter";
interface ISubmitsuggestionButtonsState { Campaigns: Array<Campaign> }
export class SubmitSuggestionButtons extends React.Component<any, ISubmitsuggestionButtonsState>
{
    constructor(props: any) {
        super(props);
        this.state = { Campaigns: new Array<Campaign>() }
    };

    componentDidMount() {
        new DataAdapter().getAllCampaigns().then((a: Array<Campaign>) => {
            this.setState({ Campaigns: a });
        });
    }

    render() {
        if (this.state.Campaigns === undefined || this.state.Campaigns.length === 0) return null;
        var campaigns = _.orderBy(this.state.Campaigns, ['Placement'], ['asc']);
        return campaigns.map((c: Campaign, idx: number) => {
            if (moment(c.StartDate) <= moment() && moment() > moment(c.EndDate))
                return;

            var url = _spPageContextInfo.webAbsoluteUrl + "/SitePages/NyttForslag.aspx";

            if (c.CompRef)
                url += "?ref=" + c.CompRef;

            if (c.Type === "Fortid")
                url += (c.CompRef) ? "&type=p" : "?type=p";

            return <DefaultButton key={idx} href={url} text={c.Text} />;
        });
    }
}