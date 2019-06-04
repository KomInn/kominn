import * as React from "react";
import * as ReactDOM from "react-dom";
import { Dropdown, IDropdownOption} from "office-ui-fabric-react/lib/DropDown"; 
import { DefaultButton} from "office-ui-fabric-react/lib/Button"; 
import { Suggestion } from "../Components/Common/Suggestion"
import { DataAdapter } from "../Components/Common/DataAdapter"; 

interface KSState { SelectedSuggestion:Suggestion, AllSuggestions:Array<Suggestion>, Message:string }
export class SendTilKS extends React.Component<any,any>
{
    state = { SelectedSuggestion:new Suggestion(), AllSuggestions:new Array<Suggestion>(), Message:""}
    
    componentWillMount()
    {
        this.loadSuggestions();
    }

    loadSuggestions()
    {
        var da = new DataAdapter();
        da.getAllSuggestions().then( (a:Array<Suggestion>) => { 
            this.setState({AllSuggestions:a}); 
        })
    }

    setSelected(i:IDropdownOption)
    {
        var item = this.state.AllSuggestions.filter( (s:Suggestion) => s.Id === i.key);
        if(!item || item.length < 1)
        {
            alert('En feil har oppstått, forslaget kan ikke sendes.'); // TODO: Fix
            return; 
        }
        this.setState({SelectedSuggestion:item[0]}, () => {            
                this.setState({Message: (item[0].SendTilKS) ? "Forslaget er allerede sendt inn." : ""});            
        });
    }

    submitToKS()
    {
        var da = new DataAdapter(); 
        da.submitToInduct(this.state.SelectedSuggestion).then( (s:string) => { 
            console.log("res ", s); 
            
            this.setState({SelectedSuggestion:new Suggestion(), Message:"Forslaget er sendt til Induct."}, () => this.loadSuggestions()); 
        }); 

    }

    render()
    {
        
        if(!this.state.AllSuggestions)
            return <div></div>

        var items = this.state.AllSuggestions.map( (s:Suggestion) => { 
            return { key:s.Id, text:s.Title } as IDropdownOption;
        })
        return <div style={{marginLeft:"10px"}}>
            <h1 style={{color:"black"}}>Eksporter til KS</h1>
            <a href={_spPageContextInfo.webAbsoluteUrl + "/Lists/InductKonfigurasjon/AllItems.aspx"}>Konfigurasjon</a>
            
            <Dropdown label="Velg forslag" options={items} onChanged={ (i:IDropdownOption) => { this.setSelected(i); }} /><br/>
            <DefaultButton text="Send til KS" 
                            disabled={(this.state.SelectedSuggestion.Id === -1 || this.state.SelectedSuggestion.SendTilKS)}
                            onClick={ () => { this.submitToKS() }} />


            <p dangerouslySetInnerHTML={ {__html:this.state.Message}}></p>


        </div>
    }
}


