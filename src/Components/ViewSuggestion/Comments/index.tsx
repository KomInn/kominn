import * as React from "react";
import { SuggestionComment } from "../../../Models/SuggestionComment";
import { Tools } from "../../../Tools";
import { DataAdapter } from "../../../Data/DataAdapter";
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { ICommentsState } from "./ICommentsState";
import { ICommentsProps } from "./ICommentsProps";

export class Comments extends React.Component<ICommentsProps, ICommentsState>
{
    constructor(props: ICommentsProps) {
        super(props);
        this.state = { text: "" };
    }

    async submitComment() {
        await new DataAdapter().submitCommentForSuggestion(this.state.text, this.props.suggestion);
        this.props.onCommentSubmitted();
        this.setState({ text: "" });
    }

    render() {
        return (
            <div>
                <h2>Kommentarer</h2>
                <div style={{ marginTop: 10 }}>
                    <TextField
                        placeholder="Hva syntes du om forslaget?"
                        multiline={true}
                        onChange={(_, newValue) => this.setState({ text: newValue })} />
                </div>
                <div style={{ marginTop: 10 }}>
                    <PrimaryButton text="Send kommentar" disabled={this.state.text.length < 3} onClick={this.submitComment.bind(this)} />
                </div>
                <ul className="comments-list">
                    {this.props.suggestion.Comments.map((item: SuggestionComment, idx: number) => {
                        return (
                            <li key={idx}>
                                <div className="img-block">
                                    <div className="img-wrapp">
                                        <img src={item.Image} width="80" height="80" />
                                    </div>
                                </div>
                                <div className="text-block">
                                    <strong className="title">{item.CreatedBy} - <time >{Tools.formatDate(item.Created)}</time></strong>
                                    <div className="comment-area">
                                        <div className="text-wrapp">
                                            <p>{item.Text}</p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
                <a id="kommentar"></a>
            </div>
        )
    }
}
