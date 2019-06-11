import * as React from "react";
import { Row, Col } from "react-bootstrap";
import { Suggestion } from "../Common/Suggestion";
import { DataAdapter } from "../Common/DataAdapter";
import { DetailsList } from "office-ui-fabric-react/lib/DetailsList";
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
						<DetailsList
							isHeaderVisible={false}
							items={this.state.suggestions}
							columns={[
								{ key: "Title", name: "Title", fieldName: "Title", minWidth: 0 },
								{ key: "Created", name: "Created", fieldName: "CreatedString", minWidth: 0 },
								{ key: "Likes", name: "Likes", fieldName: "Likes", minWidth: 0 },
								{ key: "Status", name: "Status", fieldName: "StatusString", minWidth: 0 },
							]} />
					</div>
				</section>
			</Row>
		)
	}
}