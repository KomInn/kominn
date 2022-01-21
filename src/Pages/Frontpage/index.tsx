import * as React from "react";
import * as moment from "moment";
import { Searchbar, PromotedSuggestions, PopularSuggestions, SuccessStories } from "../../Components/Frontpage";

export class Frontpage extends React.Component<{}, {}>
{
    render() {
        return (
            <>
                <PromotedSuggestions />
                <PopularSuggestions
                    title="Har søkt internt klimatilskudd 2022"
                    emptyText='Finner ingen innsendte forslag.'
                    fromDate={moment().startOf('year')}
                    toDate={moment().endOf('year')} />
                <SuccessStories title="Har fått klimatilskudd 2022" />
            </>
        )
    }
}