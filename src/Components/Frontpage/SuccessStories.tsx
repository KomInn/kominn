import * as React from "react";
import { Suggestion } from "../Common/Suggestion";
import { DataAdapter } from "../Common/DataAdapter";
import { Status } from "../Common/Status";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";

interface SuccessStoriesState { suggestions?: Array<Suggestion>, CurrentImage?: number }
export class SuccessStories extends React.Component<any, SuccessStoriesState>
{
	constructor(props: any) {
		super(props);
		this.state = { suggestions: new Array<Suggestion>(), CurrentImage: 0 };
	}

	componentWillMount() {
		var d = new DataAdapter();
		d.getAllSuggestions(Status.Success, 50).then((suggestions: Array<Suggestion>) => {
			this.setState({ suggestions });
		});
	}


	render() {
		if (this.state.suggestions.length === 0)
			return null;

		return (
			<div>
				<section className="ms-Grid SuccessStories">
					<h2>Suksesshistorier</h2>
					<div className="ms-Grid-row container">
						{this.state.suggestions.map((item: Suggestion, idx: number) => {
							return (
								<div key={idx} className="ms-Grid-col ms-sm6 item">
									<article className="item-holder">
										<div className="img-block" style={{ backgroundImage: "url('" + item.Image + "')" }}></div>
										<div className="content-area">
											<strong className="title">{item.Title}</strong>
											<p>{item.Summary}</p>
											<DefaultButton text="Vis" iconProps={{ iconName: "View" }} href={item.Url} style={{ margin: "5px 5px 0 0" }} />
											<DefaultButton text="Kommenter" iconProps={{ iconName: "Comment" }} href={item.Url + "#kommentar"} style={{ margin: "5px 5px 0 0" }} />
										</div>
									</article>
								</div>
							)
						})}
					</div>
				</section>
			</div>
		)
	}
}