import { DetailsList, IColumn, SelectionMode } from "office-ui-fabric-react/lib/DetailsList";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import * as React from "react";
import { DataAdapter } from "../../../Data/DataAdapter";
import { Suggestion } from "../../../Models";
import { IMySuggestionsState } from "./IMySuggestionsState";
import "./MySuggestions.module.scss";
import { IMySuggestionsProps } from "./IMySuggestionsProps";

export class MySuggestions extends React.Component<IMySuggestionsProps, IMySuggestionsState>
{
	private _columns: IColumn[] = [
		{ key: "Title", name: "Title", fieldName: "Title", minWidth: 0 },
		{ key: "Created", name: "Created", fieldName: "CreatedString", minWidth: 0 },
		{ key: "Likes", name: "Likes", fieldName: "Likes", minWidth: 0 },
		{ key: "Status", name: "Status", fieldName: "StatusString", minWidth: 0 },
	];

	constructor(props: any) {
		super(props);
		this.state = { suggestions: [] };
	}

	async componentWillMount() {
		const suggestions = await new DataAdapter().getMySuggestions();
		this.setState({ suggestions });
	}

	onRenderItemColumn(item: Suggestion, _index: number, column: IColumn) {
		const colValue = item[column.fieldName];
		switch (column.key) {
			case "Title": {
				return <a href={item.Url}>{colValue}</a>;
			}
			case "Likes": {
				return <span><Icon iconName="Like" /> {colValue}</span>;
			}
		}
		return colValue;
	}

	render() {
		return (
			<section className="MySuggestions">
				<div className="container">
					<h2>{this.props.title}</h2>
					<DetailsList
						isHeaderVisible={false}
						items={this.state.suggestions}
						columns={this._columns}
						onRenderItemColumn={this.onRenderItemColumn.bind(this)}
						selectionMode={SelectionMode.none} />
				</div>
			</section>
		)
	}
}