import * as React from "react";
import "./SuccessStories.module.scss";
import { DataAdapter } from "../../../Data/DataAdapter";
import { Status, Suggestion } from "../../../Models";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { SuccessStoriesState } from "./SuccessStoriesState";
import { SustainabilityGoals } from "../../Common";
import { ISuccessStoriesProps } from "./ISuccessStoriesProps";

export class SuccessStories extends React.Component<ISuccessStoriesProps, SuccessStoriesState>
{
	private dataAdapter = new DataAdapter();

	constructor(props: any) {
		super(props);
		this.state = { suggestions: [], CurrentImage: 0 };
	}

	async componentWillMount() {
		let suggestions = await this.dataAdapter.getAllSuggestions(Status.Success, 50);
		this.setState({ suggestions });
	}


	render() {
		if (this.state.suggestions.length === 0) return null;
		return (
			<div className="SuccessStories">
				<section className="ms-Grid">
					<h2>{this.props.title}</h2>
					<div className="ms-Grid-row">
						{this.state.suggestions.map((suggestion: Suggestion, idx: number) => {
							return (
								<article key={idx} className="ms-Grid-col ms-sm5 ms-smPush1 item">
									<div className="content-area">
										<strong className="title">{suggestion.Title}</strong>
										<p>{suggestion.Summary}</p>
										<SustainabilityGoals style={{ margin: '10px 0 10px 0' }} goals={suggestion.SustainabilityGoals} />
										<DefaultButton text="Vis" iconProps={{ iconName: "View" }} href={suggestion.Url} style={{ margin: "5px 5px 0 0" }} />
										<DefaultButton text="Kommenter" iconProps={{ iconName: "SuggestionComment" }} href={suggestion.Url + "#kommentar"} style={{ margin: "5px 5px 0 0" }} />
									</div>
								</article>
							)
						})}
					</div>
				</section>
			</div>
		)
	}
}