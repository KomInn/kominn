import * as React from "react";
import { Row, Col } from "react-bootstrap";
import { Suggestion } from "../Common/Suggestion";
import { Comment } from "../Common/Comment";
import { Tools } from "../Common/Tools";
import { DataAdapter } from "../Common/DataAdapter";
interface CommentsState { text:string }
interface CommentsProps { suggestion:Suggestion, onCommentSubmitted():void  }
export class Comments extends React.Component<CommentsProps, CommentsState>
{
       
    state = { text:""}
    
    submitComment(evt:any)
    {
        evt.preventDefault(); 
        var da = new DataAdapter();       
        da.submitCommentForSuggestion(this.state.text, this.props.suggestion).then( () => {  this.props.onCommentSubmitted(); this.setState({text:""})});
        
    }    

    render()
    {        
        return (
            <Row>                 
                <form action="#" className="comments-form" id="kommentar">
                    <label htmlFor="kommentarer">Kommentarer</label>
                    <textarea id="kommentarer" onChange={ (e:any) => { this.setState({text:e.target.value}); }} value={this.state.text} cols={30} rows={10} placeholder="Hva syntes du om forslaget?"></textarea>
                    <button className="btn" onClick={this.submitComment.bind(this)}>Send kommentar</button>
                </form>
                <ul className="comments-list">
                    { this.props.suggestion.Comments.map( (item:Comment, index:number) => { 
             return( <li>
                        <div className="img-block">
                            <div className="img-wrapp">
                                <img src={item.Image} width="80" height="80" alt="image description"/>
                            </div>
                        </div>
                        <div className="text-block">
                            <strong className="title">{item.CreatedBy} - <time >{Tools.FormatDate(item.Created)}</time></strong>
                            <div className="comment-area">
                                <div className="text-wrapp">
                                    <p>{item.Text}</p>
                                </div>
                            </div>
                        </div>
                    </li>)
                    })}                  
                </ul>
            </Row>                    
        )
    }
}
