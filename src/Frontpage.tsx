import * as React from "react";
import { Searchbar, PromotedSuggestions, PopularSuggestions, SuccessStories, MySuggestions } from "./Components/Frontpage";

export class Frontpage extends React.Component<any, any>
{   
    render()
    {
        return (
            <>
                <Searchbar />
                <PromotedSuggestions  />
                <PopularSuggestions Title="Innsendte forslag inneværende år" FromDate="2019-01-01" ToDate="2020-01-01" />
                <PopularSuggestions Title="Fikk innovasjonsmidler foregående år" FromDate="2018-01-01" ToDate="2019-01-01" />
                <SuccessStories  />
                <MySuggestions />
                <a className="accessibility" href="#wrapper">Back to top</a>
            </>           
        )
    }
}