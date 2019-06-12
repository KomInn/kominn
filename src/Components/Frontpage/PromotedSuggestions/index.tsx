import * as React from "react";
import Slider from "react-slick";
import "./PromotedSuggestions.module.scss";
import { DataAdapter } from "../../Common/DataAdapter";
import { Status } from "../../Common/Status";
import { IPromotedSuggestionsState } from "./IPromotedSuggestionsState";

interface IPromotedSuggestionsProps { }

export class PromotedSuggestions extends React.Component<IPromotedSuggestionsProps, IPromotedSuggestionsState>
{
	private dataAdapter = new DataAdapter();

	constructor(props: IPromotedSuggestionsProps) {
		super(props);
		this.state = { suggestions: [], CurrentImage: 0 };
	}


	async componentWillMount() {
		let suggestions = await this.dataAdapter.getAllSuggestions(Status.Promoted, 50);
		this.setState({ suggestions });
	}

	monToNorName(date: Date): string {
		switch (date.getMonth()) {
			case 0: return "Januar";
			case 1: return "Februar";
			case 2: return "Mars";
			case 3: return "April";
			case 4: return "Mai";
			case 5: return "Juni";
			case 6: return "Juli";
			case 7: return "August";
			case 8: return "September";
			case 9: return "Oktober";
			case 10: return "November";
			case 11: return "Desember";
		}
	}


	render() {
		if (this.state.suggestions.length <= 0) return null;

		return (
			<div className="PromotedSuggestions">
				<div className="container">
					<Slider
						dots={true}
						infinite={true}
						speed={500}
						slidesToShow={1}>
						{this.state.suggestions.map((s, idx: number) => (
							<div key={idx} className="slide">
								<div className="slide-inner" style={{ backgroundImage: "url('" + s.Image + "')" }}>
									<div className="text-block">
										<p>Månedens innovasjon for {this.monToNorName(s.Created)}</p>
										<h1><a href={s.Url} style={{ color: "white" }}>{s.Title}</a></h1>
									</div>
									<div className="summary-text">
										<p>{s.Summary}</p>
									</div>
								</div>
							</div>
						))}
					</Slider>
				</div>
			</div>
		)
	}
}