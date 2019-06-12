import * as React from "react";
import "./SuccessStories.module.scss";
import { Suggestion } from "../../Common/Suggestion";
import { DataAdapter } from "../../Common/DataAdapter";
import { Status } from "../../Common/Status";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { SuccessStoriesState } from "./SuccessStoriesState";

export class SuccessStories extends React.Component<any, SuccessStoriesState>
{
	private dataAdapter = new DataAdapter();

	constructor(props: any) {
		super(props);
		this.state = { suggestions: new Array<Suggestion>(), CurrentImage: 0 };
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
					<h2>Suksesshistorier</h2>
					<div className="ms-Grid-row">
						{this.state.suggestions.map((item: Suggestion, idx: number) => {
							return (
								<article key={idx} className="ms-Grid-col ms-sm5 ms-smPush1 item">
									{/* <div className="img-block" style={{ backgroundImage: `url('${item.Image}')` }}></div> */}
									<div className="content-area">
										<strong className="title">{item.Title}</strong>
										<p>{item.Summary}</p>
										<DefaultButton text="Vis" iconProps={{ iconName: "View" }} href={item.Url} style={{ margin: "5px 5px 0 0" }} />
										<DefaultButton text="Kommenter" iconProps={{ iconName: "Comment" }} href={item.Url + "#kommentar"} style={{ margin: "5px 5px 0 0" }} />
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