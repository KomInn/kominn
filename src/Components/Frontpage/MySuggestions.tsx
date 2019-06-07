import * as React from "react";
import { Row, Col } from "react-bootstrap";
import { Suggestion } from "../Common/Suggestion";
import { DataAdapter } from "../Common/DataAdapter";
import { Status } from "../Common/Status";
import { Tools } from "../Common/Tools";

interface MySuggestionsState { suggestions: Array<Suggestion> }
export class MySuggestions extends React.Component<any, MySuggestionsState>
{
	state = { suggestions: new Array<Suggestion>() };

	componentWillMount() {
		var d = new DataAdapter();
		d.getMySuggestions().then((results: Array<Suggestion>) => {
			this.setState({ suggestions: results });
		});
	}
	render() {
		return (
			<Row>
				<section className="section-offers hidden-xs">
					<div className="container">
						<h2>Mine forslag</h2>
						<div className="offers-table">
							{this.state.suggestions.map((item: Suggestion, idx: number) => {
								return (
									<div className="table-row" key={`TableRow_${idx}`}>
										<div className="col">
											<a href="#" className="title-block">
												{item.Image == "" ? "" :
													<div className="img-block">
														<img src={item.Image} width="49" height="49" alt="image description" />
													</div>}
												<strong className="title">{item.Title}</strong>
											</a>
										</div>
										<div className="col">
											<time>{Tools.FormatDate(item.Created)}</time>
										</div>
										<div className="col">
											<div className="counter-block">
												<i className="icon-like"></i>
												<span className="counter">{item.Likes}
												</span>
											</div>
										</div>
										<div className="col">
											<a href="#" className="btn-link">{Tools.statusToString(item.Status)}</a>
										</div>
										<div className="col">
											{ /* <a href="#" className="btn-close"><span className="hidden">X</span></a> */}
										</div>
									</div>
								)
							})}
						</div>
					</div>
				</section>
			</Row>
		)
	}
}