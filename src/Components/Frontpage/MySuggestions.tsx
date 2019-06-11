import * as React from "react";
import { Suggestion } from "../Common/Suggestion";
import { DataAdapter } from "../Common/DataAdapter";
import { DetailsList, IColumn } from "office-ui-fabric-react/lib/DetailsList";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import { autobind } from "office-ui-fabric-react/lib/Utilities";

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

	@autobind
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
			<section className="section-offers hidden-xs">
				<div className="container">
					<h2>Mine forslag</h2>
					<DetailsList
						isHeaderVisible={false}
						items={this.state.suggestions}
						columns={[
							{ key: "Title", name: "Title", fieldName: "Title", minWidth: 0 },
							{ key: "Created", name: "Created", fieldName: "CreatedString", minWidth: 0 },
							{ key: "Likes", name: "Likes", fieldName: "Likes", minWidth: 0 },
							{ key: "Status", name: "Status", fieldName: "StatusString", minWidth: 0 },
						]}
						onRenderItemColumn={this.onRenderItemColumn} />
				</div>
			</section>
		)
	}
}