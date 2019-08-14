
import * as React from "react";
import { DetailsList, IColumn } from "office-ui-fabric-react";

class FVurdering {
    Title: string;
    Gjennomforbarhet: number;
    Innbyggerinvolvering: number;
    Spredningspotensiale: number;
    Innovasjonsgrad: number;
    Kommentar: string;
    FlereAktorer: boolean;
    Lovkrav: boolean;
    Id: number;
    ForslagId: number;
}

class FSnittVurdering extends FVurdering {
    AntallVurderinger: number;
}

interface State {
    items: Array<FVurdering>,
    snittvurderinger: Array<FSnittVurdering>

}

export class Vurdering extends React.Component<any, State>
{
    state = { items: new Array<FVurdering>(), snittvurderinger: new Array<FSnittVurdering>() }


    componentWillMount() {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Forslagsvurdering')/Items?$select=*,Forslag/Title&$expand=Forslag",
            contentType: "application/json;odata=verbose",
            success: (data: any) => {
                if (data.d.results.length < 0)
                    return;

                var result = data.d.results.map((s: any) => {
                    var k = new FVurdering();
                    k.Innovasjonsgrad = s.ScoreDegreeOfInnovation;
                    k.Spredningspotensiale = s.ScoreDistributionPotential;
                    k.Gjennomforbarhet = s.ScoreFeasability;
                    k.Innbyggerinvolvering = s.ScoreUserInvolvement;
                    k.Kommentar = s.ShortComment;
                    k.Id = s.Id;
                    k.Lovkrav = s.LawRequirements;
                    k.FlereAktorer = s.MoreActors;
                    k.ForslagId = s.ForslagId;
                    k.Title = s.Forslag.Title;
                    return k;

                });
                this.setState({ items: result });
                var y = new Array<FSnittVurdering>();
                for (let k of result) {

                    var u = new FSnittVurdering();
                    u.ForslagId = k.ForslagId;
                    u.Gjennomforbarhet = 0;
                    u.Innbyggerinvolvering = 0;
                    u.Innovasjonsgrad = 0;
                    u.Spredningspotensiale = 0;
                    u.AntallVurderinger = 0;
                    u.Title = k.Title;

                    for (let i of result) {
                        if (u.ForslagId === i.ForslagId) {
                            u.Gjennomforbarhet += i.Gjennomforbarhet;
                            u.Innbyggerinvolvering += i.Innbyggerinvolvering;
                            u.Innovasjonsgrad += i.Innovasjonsgrad;
                            u.Spredningspotensiale += i.Spredningspotensiale;
                            u.AntallVurderinger += 1;
                        }
                    }
                    u.Gjennomforbarhet = u.Gjennomforbarhet / u.AntallVurderinger;
                    u.Innbyggerinvolvering = u.Innbyggerinvolvering / u.AntallVurderinger;
                    u.Spredningspotensiale = u.Spredningspotensiale / u.AntallVurderinger;
                    u.Innovasjonsgrad = u.Innovasjonsgrad / u.AntallVurderinger;
                    var idx = 0;
                    var existing = y.filter((s, index) => { if (s.ForslagId === u.ForslagId) { idx = index; return true; } });
                    if (existing.length <= 0)
                        y.push(u);
                    else
                        y[idx] = u;
                }
                this.setState({ snittvurderinger: y });


            }
        });
    }

    columns = [
        {
            key: "title",
            name: "Tittel",
            fieldName: "Title"
        },
        {
            key: "ant",
            name: "Vurderinger",
            fieldName: "AntallVurderinger"
        },
        {
            key: "gjf",
            name: "Gjennomførbarhet",
            fieldName: "Gjennomforbarhet"
        },
        {
            key: "inb",
            name: "Bruker / inbyggerinvolvering",
            fieldName: "Innbyggerinvolvering"
        },
        {
            key: "spr",
            name: "Spredningspotensial",
            fieldName: "Spredningspotensiale"
        },
        {
            key: "innova",
            name: "Innovasjonsgrad",
            fieldName: "Innovasjonsgrad"
        },
    ] as IColumn[];


    render() {
        return <div>
            <h3 style={{ color: "black" }}>Vurdering av mottatte forslag</h3>
            <p>Listen viser snitt av alle mottatte vurderinger per forslag</p>
            <DetailsList columns={this.columns} items={this.state.snittvurderinger} />

        </div>
    }
}