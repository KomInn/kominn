import * as React from "react";
import * as moment from "moment";
import { Searchbar, PromotedSuggestions, PopularSuggestions, SuccessStories, MySuggestions } from "../../Components/Frontpage";

export class Frontpage extends React.Component<{}, {}>
{
    render() {
        return (
            <>
                <Searchbar placeholderText="Søk etter forslag..." />
                <PromotedSuggestions />
                <PopularSuggestions
                    title="Innsendte forslag inneværende år"
                    emptyText='Finner ingen innsendte forslag for inneværende år.'
                    fromDate={moment().startOf('year')}
                    toDate={moment().endOf('year')} />
                <PopularSuggestions
                    title="Fikk innovasjonsmidler foregående år"
                    emptyText={`Finner ingen forslag som fikk innovasjonsmidler i ${moment().subtract(1, 'year').year()}.`}
                    fromDate={moment().subtract(1, 'year').startOf('year')}
                    toDate={moment().subtract(1, 'year').endOf('year')} />
                <SuccessStories title="Suksesshistorier" />
                <MySuggestions title="Mine forslag" />
                <a className="accessibility" href="#wrapper">Back to top</a>
            </>
        )
    }
}