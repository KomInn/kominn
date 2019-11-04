import * as React from "react"
import { DataAdapter } from "../../../Data/DataAdapter";
import { DoneThisModal } from "../../Common/DoneThisModal";
import { Status, Suggestion } from "../../../Models";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import { IActionsState } from "./IActionsState";
import { IActionsProps } from "./IActionsProps";

export class Actions extends React.Component<IActionsProps, IActionsState>
{
	constructor(props: IActionsProps) {
		super(props);
		this.state = { showModal: false, numLikes: 0, inspiredBy: new Suggestion() };
	}

	@autobind
	like() {
		if (this.state.updatingLike) return;
		this.setState({ updatingLike: true });
		new DataAdapter().updateLike(this.props.suggestion).then((result: Suggestion) => { this.setState({ numLikes: result.Likes, updatingLike: false }) });
	}

	@autobind
	openModal() {
		this.setState({ showModal: true, inspiredBy: this.props.suggestion });
	}

	@autobind
	closeModal() {
		this.setState({ showModal: false });
	}

	componentWillMount() {
		this.setState({ numLikes: this.props.suggestion.Likes });
	}

	componentDidMount() {
		if (window.location.hash === "#kommentar") this.scrollToComments();

	}

	@autobind
	scrollToComments() {
		const element = document.querySelector("#kommentar");
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	render() {
		var type = (this.props.suggestion.Status === Status.Success) ? "Suksesshistorie" : "Forslag";
		if (this.props.suggestion.IsPast)
			type = "Gjort tidligere"
		return (
			<div>
				<div>
					<span><Icon iconName="Tag" /></span>
					<span>&nbsp;{type}</span>
				</div>
				<DoneThisModal show={this.state.showModal} inspiredBy={this.state.inspiredBy} onClose={this.closeModal.bind(this)} />
				<div className="sub-box">
					{this.props.suggestion.Likes > 0 && <strong className="title-block"><span className="counter">{this.state.numLikes}</span> liker</strong>}
					<div style={{ marginTop: 15, marginBottom: 15 }}>
						<DefaultButton text="Like" iconProps={{ iconName: "Like" }} onClick={this.like} style={{ margin: "5px 5px 0 0" }} />
						<DefaultButton text="Dette vil vi også gjøre" onClick={this.openModal} style={{ margin: "5px 5px 0 0" }} />
					</div>
				</div>
			</div>
		)
	}
}

