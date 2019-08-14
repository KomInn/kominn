import * as React from "react";
import { DataAdapter } from "../../../Data/DataAdapter";
import { DoneThisModal } from "../../Common/DoneThisModal";
import { Suggestion } from "../../../Models";
import { IInnovationOfTheMonthState } from "./IInnovationOfTheMonthState";

export class InnovationOfTheMonth extends React.Component<{}, IInnovationOfTheMonthState>
{
	constructor(props: any) {
		super(props);
		this.state = { suggestions: [], show: false, inspiredBy: new Suggestion() };
	}

	componentWillMount() {
		var now = new Date();
		var query = "&$filter=(MonthlyStartDate le datetime'" + now.toISOString() + "') and (MonthlyEndDate ge datetime'" + now.toISOString() + "')";
		var d = new DataAdapter();
		d.getAllSuggestions(null, 1, query).then((results: Suggestion[]) => {
			this.setState({ suggestions: results });
		});
	}

	openModal(s: Suggestion) {
		this.setState({ inspiredBy: s, show: true });
	}

	render() {
		if (this.state.suggestions.length <= 0)
			return (<div></div>);

		return (
			<>
				<DoneThisModal show={this.state.show} inspiredBy={this.state.inspiredBy} onClose={() => { this.setState({ show: false }); }} />
				<section className="carousel-section">
					<div className="container">
						<h2>Månedens innovasjon</h2>
						<div className="carousel">
							<div className="mask">
								<div className="slideset">
									{this.state.suggestions.map((item: Suggestion, index: number) => {
										return (<div className="slide">
											<article className="slide-holder">
												<div className="img-block" style={{ backgroundImage: "url('" + item.Image + "')" }}>
												</div>
												<div className="content-area">
													<strong className="title">{item.Title}</strong>
													<p>{item.Summary}</p>
													<ul className="btn-list">
														<li><a href={item.Url} className="btn beige">Vis</a></li>
														<li><a onClick={() => this.openModal(item)} className="btn beige">Kommenter</a></li>
													</ul>
												</div>
											</article>
										</div>)
									})}
								</div>
							</div>
						</div>
					</div>
				</section>
			</>
		)
	}
}