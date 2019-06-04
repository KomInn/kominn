import * as React from "react";

import { Searchbar } from "./Components/Frontpage/Searchbar";
import { PromotedSuggestions } from "./Components/Frontpage/PromotedSuggestions";
import { PopularSuggestions } from "./Components/Frontpage/PopularSuggestions";
import { InnovationOfTheMonth } from "./Components/Frontpage/InnovationOfTheMonth";
import { SuccessStories } from "./Components/Frontpage/SuccessStories"; 
import { MySuggestions }from "./Components/Frontpage/MySuggestions"; 
import { DataAdapter } from "./Components/Common/DataAdapter"; 

import { Suggestion } from "./Components/Common/Suggestion"; 


export class Frontpage extends React.Component<any, any>
{   
    render()
    {
        return (
            <div className="container-fluid">
                <Searchbar />
                <PromotedSuggestions  />
                <PopularSuggestions Title="Innsendte forslag 2018" FromDate="2018-01-01" ToDate="2019-01-01" />
                <PopularSuggestions Title="Fikk innovasjonsmidler 2017" FromDate="2017-01-01" ToDate="2018-01-01" />
                {/*<InnovationOfTheMonth  />*/}
                <SuccessStories  />
                <MySuggestions />
                <a className="accessibility" href="#wrapper">Back to top</a>
            </div>           
        )
    }
}