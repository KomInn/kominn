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
                    title="Har søkt internt klimatilskudd 2021"
                    emptyText='Finner ingen innsendte forslag.'
                    fromDate={moment().startOf('year')}
                    toDate={moment().endOf('year')} />
            </>
        )
    }
}