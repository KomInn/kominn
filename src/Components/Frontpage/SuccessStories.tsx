import * as React from "react";
import { Row, Col } from "react-bootstrap";
import { Suggestion } from "../Common/Suggestion";
import { DataAdapter } from "../Common/DataAdapter";
import { Status } from "../Common/Status";
import { DoneThisModal } from "../Common/DoneThisModal";

interface SuccessStoriesState { suggestions?: Array<Suggestion>, CurrentImage?: number, show: boolean, inspiredBy: Suggestion }
export class SuccessStories extends React.Component<any, SuccessStoriesState>
{
	state = { suggestions: new Array<Suggestion>(), CurrentImage: 0, show: false, inspiredBy: new Suggestion() };

	componentWillMount() {
		var d = new DataAdapter();
		d.getAllSuggestions(Status.Success, 50).then((results: Array<Suggestion>) => {
			this.setState({ suggestions: results });
		});
	}
	setNextImage() {

		if (this.state.CurrentImage + 1 >= this.state.suggestions.length) {
			this.setState({ CurrentImage: 0 });
			return;
		}

		this.setState({ CurrentImage: this.state.CurrentImage + 1 });
	}

	setPrevImage() {
		if (this.state.CurrentImage - 1 <= -1) {
			this.setState({ CurrentImage: this.state.suggestions.length - 1 });
			return;
		}

		this.setState({ CurrentImage: this.state.CurrentImage - 1 });
	}

	openModal(s: Suggestion) {
		this.setState({ show: true, inspiredBy: s });
	}


	render() {
		if (this.state.suggestions.length <= 0)
			return (<div></div>);

		return (
			<Row>
				<DoneThisModal show={this.state.show} inspiredBy={this.state.inspiredBy} onClose={() => { this.setState({ show: false }); }} />
				<section className="carousel-section">
					<div className="container">
						<h2>Suksesshistorier</h2>
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
														<li><a href={item.Url + "#kommentar"} className="btn beige">Kommenter</a></li>
													</ul>
												</div>
											</article>
										</div>)
									})}
								</div>
							</div>
							{(this.state.suggestions.length <= 1) ? "" :
								<span><a className="btn-prev" href="#" onClick={this.setPrevImage.bind(this)}><i className="icon-arrow-l"></i></a>
									<a className="btn-next" href="#" onClick={this.setNextImage.bind(this)}><i className="icon-arrow-r"></i></a></span>}
							{/*<div className="pagination">
									<ul>
										<li><a href="#"><span className="hidden">bullet</span></a></li>
										<li className="active"><a href="#"><span className="hidden">bullet</span></a></li>
										<li><a href="#"><span className="hidden">bullet</span></a></li>
									</ul>
								</div>*/}
						</div>
						{/*<a href="#" className="btn blue">Vis alle suksesshistoriene</a>*/}
					</div>
				</section>
			</Row>)
	}
}