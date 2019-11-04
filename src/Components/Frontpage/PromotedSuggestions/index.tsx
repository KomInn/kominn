import * as React from "react";
import Slider from "react-slick";
import "./PromotedSuggestions.module.scss";
import { DataAdapter } from "../../../Data/DataAdapter";
import { Status } from "../../../Models/Status";
import { IPromotedSuggestionsState } from "./IPromotedSuggestionsState";
import { IPromotedSuggestionsProps } from "./IPromotedSuggestionsProps";
import { Tools } from "../../../Tools";

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
						{this.state.suggestions.map((suggestion, idx: number) => (
							<div key={idx} className="slide">
								<div className="slide-inner" style={{ backgroundImage: "url('" + suggestion.Image + "')" }}>
									<div className="text-block">
										<p>Månedens innovasjon for {Tools.getMonthName(suggestion.Created)}</p>
										<h1><a href={suggestion.Url} style={{ color: "white" }}>{suggestion.Title}</a></h1>
									</div>
									<div className="summary-text">
										<p>{suggestion.Summary}</p>
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