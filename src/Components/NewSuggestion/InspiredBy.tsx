import * as React from "react";
import { Row, Col, ListGroup, ListGroupItem } from "react-bootstrap";
import { Suggestion } from "../Common/Suggestion"; 
import { DataAdapter } from "../Common/DataAdapter"; 


interface InspiredByProps { onDataUpdate?(inspiredBy:Array<Suggestion>):void }
interface InspiredByState { inspiredBy:Array<Suggestion>, suggestions:Array<Suggestion>, searchval?:string }
export class InspiredBy extends React.Component<InspiredByProps, InspiredByState>
{
    state = { suggestions:new Array<Suggestion>(), inspiredBy:new Array<Suggestion>(), searchval:"" };
    componentWillMount()
    {        
        var copiedSuggestion = GetUrlKeyValue("kopier"); 
        if(copiedSuggestion)
        {           
            var d = new DataAdapter();
            d.getSuggestionById(copiedSuggestion).then( (result:Suggestion[]) => {
                    if(result.length > 0)
                        this.addInspiredBy(result[0]);
            });
        }
    }
    searchSuggestion(evt:any)
    {             
        this.setState({searchval:evt.target.value}, () => {            
            var title = this.state.searchval;  
            if(title == null || title == "" || title.length <= 3)
            {
                this.setState({suggestions:new Array<Suggestion>()});
                return;
            }

            var d = new DataAdapter();
            d.getSuggestionByTitle(title).then( (result:Array<Suggestion>) => {             
                this.setState({suggestions:result}); 
            }); 
        });
    }

    addInspiredBy(suggestion:Suggestion)
    {
        var s = this.state.inspiredBy; 
        if(this.itemNotPreviouslySelected(suggestion))
            s.push(suggestion); 
        
        this.setState({inspiredBy:s}, () => { 
            this.props.onDataUpdate(this.state.inspiredBy);
            this.setState({searchval:""}, () => { 
                this.setState({suggestions:new Array<Suggestion>()});
            });
        }); 
    }

    itemNotPreviouslySelected(s:Suggestion)
    {
        for(let item of this.state.inspiredBy)
        {
            if(item.Id == s.Id)
                return false; 
        }
        return true; 
    }

    removeItem(index:number)
    {
        var s = this.state.inspiredBy; 
        s.splice(index, 1); 
        this.setState({inspiredBy:s}); 
    }

    render()
    {
        return (
<Row>                 
    <Col xs={12}>        
    <div className="form-area">
        <label htmlFor="inspirasjon">Inspirasjon (valgfritt)</label>
        <p>Hvis du ble inspirert av noen av de andre forslagene du så, kan du lete etter de ved å skrive noe av teksten i søkefeltet under</p>
        <input id="inspirasjon" type="text" placeholder="Søk" onChange={this.searchSuggestion.bind(this)} value={this.state.searchval} />
        <ListGroup style={{marginTop:"-31px"}}>
        {this.state.suggestions.map( (item:Suggestion, index:number) => {         
        return (
        
                <ListGroupItem>
                    {item.Image == "" ? "" :
                    <img src={item.Image} style={{width:"64px", verticalAlign:"middle", marginRight:"10px"}}/>}
                    <a href="#" onClick={ () => this.addInspiredBy(item) }>{item.Title}</a>
                </ListGroupItem>
        )
        })}
        </ListGroup>
        <div className="offers-table alt">
            {this.state.inspiredBy.map( (item:Suggestion, index:number) => { 
            return (
            <div className="table-row">
                <div className="col">
                    <a href={item.Url} className="title-block">
                        <div className="img-block">
                            {(item.Image == "") ? "" : 
                            <img src={item.Image} alt="" />}
                        </div>
                        <strong className="table-title">{item.Title}</strong>
                    </a>
                </div>
                <div className="col">
                    <a href="#" className="btn-close" onClick={ () =>  this.removeItem(index)  }><span className="hidden" >X</span></a>
                </div>
            </div> ) 
            })}          
        </div>
    </div>  
    </Col>
</Row>                    
        )
    }
}