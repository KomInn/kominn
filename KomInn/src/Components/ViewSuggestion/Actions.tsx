import * as React from "react";
import { Row, Col } from "react-bootstrap";
import { Suggestion } from "../Common/Suggestion";
import { DataAdapter } from "../Common/DataAdapter";
import { DoneThisModal} from "../Common/DoneThisModal";
import { Status } from "../Common/Status"; 
import { SuggestionRating } from "../ViewSuggestion/SuggestionRating"; 

interface IActionsState { showModal: boolean, numLikes:number, inspiredBy:Suggestion}
interface ActionsProps { suggestion?:Suggestion }

export class Actions extends React.Component<ActionsProps, IActionsState>
{
	private updatingLike:boolean; 
	
    state = { showModal: false, numLikes:0, inspiredBy:new Suggestion() };
    
	like()
	{
	
		if(this.updatingLike)
			return; 

		var da = new DataAdapter(); 		
		this.updatingLike = true; 
		da.updateLike(this.props.suggestion).then( (result:Suggestion) => { this.setState({numLikes:result.Likes}, () => this.updatingLike = false)}); 
	}

	openModal(s:Suggestion){
		this.setState({showModal: true, inspiredBy:s});
	}
	closeModal()
	{ 	
		this.setState({showModal:false }); 
	}

	componentWillMount()
	{		
		this.updatingLike = false; 	
		this.setState({numLikes:this.props.suggestion.Likes}); 		
	}

	componentDidMount()
	{
		if(window.location.hash === "#kommentar")
			this.scrollToComments();
		
	}
	private scrollToComments()
	{
		const element = document.querySelector("#kommentar");		
		if (element) {
			element.scrollIntoView({
				behavior: 'smooth'
			});
		}
	}
    render()
    {		
		var type = (this.props.suggestion.Status === Status.Success) ? "Suksesshistorie" : "Forslag"; 
		if(this.props.suggestion.IsPast) 
			type = "Gjort tidligere"
        return (
            <Row> 
				<div className="glyphicon glyphicon-tag"></div> {type}
				<DoneThisModal show={this.state.showModal} inspiredBy={this.state.inspiredBy} onClose={this.closeModal.bind(this)} />           
				<div className="sub-box">
					<div className="list-holder">
						{ (this.props.suggestion.Likes <= 0) ? "" : 
						<strong className="title-block"><span className="counter">{this.state.numLikes}</span> liker</strong>}
						<ul className="btn-list">
							<li className="active"><a href="#" onClick={this.like.bind(this)} className="btn icon"><i className="icon-like"></i>Like</a></li>
							<li><a href="#kommentar" onClick={this.scrollToComments.bind(this)} className="btn">Kommenter</a></li>
							<li><a onClick={ () => this.openModal(this.props.suggestion)} className="btn">Dette vil vi også gjøre</a></li>
						</ul>
						<SuggestionRating sugggestion={this.props.suggestion} />
					</div>
				</div>
            </Row>                    
        )
    }
}

