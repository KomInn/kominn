import * as React from "react";
import { Searchbar } from "./Components/Frontpage/Searchbar";
import { PromotedSuggestions } from "./Components/Frontpage/PromotedSuggestions";
import { PopularSuggestions } from "./Components/Frontpage/PopularSuggestions";
import { SuccessStories } from "./Components/Frontpage/SuccessStories"; 
import { MySuggestions }from "./Components/Frontpage/MySuggestions"; 


export class Frontpage extends React.Component<any, any>
{   
    render()
    {
        return (
            <div className="container-fluid">
                <Searchbar />
                <PromotedSuggestions  />
                <PopularSuggestions Title="Innsendte forslag inneværende år" FromDate="2019-01-01" ToDate="2020-01-01" />
                <PopularSuggestions Title="Fikk innovasjonsmidler foregående år" FromDate="2018-01-01" ToDate="2019-01-01" />
                <SuccessStories  />
                <MySuggestions />
                <a className="accessibility" href="#wrapper">Back to top</a>
            </div>           
        )
    }
}