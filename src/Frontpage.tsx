import * as React from "react";
import * as moment from "moment";
import { Searchbar, PromotedSuggestions, PopularSuggestions, SuccessStories, MySuggestions } from "./Components/Frontpage";

export class Frontpage extends React.Component<any, any>
{
    render() {
        return (
            <>
                <Searchbar />
                <PromotedSuggestions />
                <PopularSuggestions
                    title="Innsendte forslag inneværende år"
                    fromDate={moment().startOf('year')}
                    toDate={moment().endOf('year')} />
                <PopularSuggestions
                    title="Fikk innovasjonsmidler foregående år"
                    fromDate={moment().subtract(1, 'year').startOf('year')}
                    toDate={moment().subtract(1, 'year').endOf('year')} />
                <SuccessStories />
                <MySuggestions />
                <a className="accessibility" href="#wrapper">Back to top</a>
            </>
        )
    }
}