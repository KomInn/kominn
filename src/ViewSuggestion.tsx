import * as React from "react";

import { Searchbar } from "./Components/Frontpage/Searchbar";
import { Content } from "./Components/ViewSuggestion/Content";
import { Actions } from "./Components/ViewSuggestion/Actions";
import { Summary }from "./Components/ViewSuggestion/Summary";
import { MapView }from "./Components/ViewSuggestion/Map"; 
import { InspiredBy } from "./Components/ViewSuggestion/InspiredBy"; 
import { Comments } from "./Components/ViewSuggestion/Comments";
import { Suggestion } from "./Components/Common/Suggestion";
import { DataAdapter } from "./Components/Common/DataAdapter";

interface ViewSuggestionState { suggestion:Suggestion}
export class ViewSuggestion extends React.Component<any, ViewSuggestionState>
{
  
    state = { suggestion:new Suggestion() }; 
    
    componentWillMount()
    {   
        /* Updates likes every 30 seconds */     
        setInterval( () => { 
            this.loadSuggestion();
        }, 30000); 
        this.loadSuggestion();         
    }

    loadSuggestion()
    {          
        var id = GetUrlKeyValue("forslag");        
        if(id == null || id == "") 
        {
            this.redirectToFrontpage();
            return; 
        }
        var da = new DataAdapter();
        da.getSuggestionById(id).then( 
            (s:Array<Suggestion>) => {                            
                if(s.length <= 0)
                {
                    this.redirectToFrontpage();
                    return; 
                }                
                da.getCommentsForSuggestion(s[0]).then( (result:Suggestion) => {                                                  
                    this.setState({suggestion:result});                    
                });
             });       
    }

    redirectToFrontpage()
    {
         document.location.href = _spPageContextInfo.webAbsoluteUrl; 
    }
    render()
    {        
        
          if(this.state.suggestion == null || this.state.suggestion.Id == -1)
            return <div></div>; 

        return (
        <div className="container-fluid">
            <Searchbar isBackNavigation={true} />
            <section className="section-frame">
                <div className="container">
                    <div className="box-wrapp">
                        <Content suggestion={this.state.suggestion} />
                    </div>
                    <div id="sidebar">
                        <Actions suggestion={this.state.suggestion} />
                        <MapView suggestion={this.state.suggestion} />
                    </div>
                    <div className="box-wrapp">                        
                            <Summary  suggestion={this.state.suggestion}  />
                            <InspiredBy  suggestion={this.state.suggestion}  />
                            
                            <div id="kommentar">
                                <Comments  suggestion={this.state.suggestion} onCommentSubmitted={this.loadSuggestion.bind(this)} />
                            </div>                                                                                   
                    </div>
                </div>
            </section>
        </div>
        )
    }
}