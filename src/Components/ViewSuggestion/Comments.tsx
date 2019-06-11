import * as React from "./node_modules/react";
import { Suggestion } from "../Common/Suggestion";
import { Comment } from "../Common/Comment";
import { Tools } from "../Common/Tools";
import { DataAdapter } from "../Common/DataAda./node_modules/office-ui-fabric-react/lib/Buttonrom "office-ui-fabric-react/lib/Button";
impor./node_modules/office-ui-fabric-react/lib/TextFieldic-react/lib/TextField";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
./node_modules/office-ui-fabric-react/lib/UtilitiesCommentsState { text: string }
interface ICommentsProps { suggestion: Suggestion, onCommentSubmitted(): void }
export class Comments extends React.Component<ICommentsProps, ICommentsState>
{
    constructor(props: ICommentsProps) {
        super(props);
        this.state = { text: "" };
    }

    @autobind
    async submitComment(evt: any) {
        evt.preventDefault();
        await new DataAdapter().submitCommentForSuggestion(this.state.text, this.props.suggestion);
        this.props.onCommentSubmitted();
        this.setState({ text: "" });
    }

    render() {
        return (
            <div>
                <TextField
                    label="Kommentarer"
                    placeholder="Hva syntes du om forslaget?"
                    multiline={true}
                    onChange={(_event, newValue) => this.setState({ text: newValue })} />
                <div style={{ marginTop: 10 }}>
                    <PrimaryButton text="Send kommentar" disabled={this.state.text.length < 3} onClick={this.submitComment} />
                </div>
                <ul className="comments-list">
                    {this.props.suggestion.Comments.map((item: Comment, idx: number) => {
                        return (
                            <li key={idx}>
                                <div className="img-block">
                                    <div className="img-wrapp">
                                        <img src={item.Image} width="80" height="80" />
                                    </div>
                                </div>
                                <div className="text-block">
                                    <strong className="title">{item.CreatedBy} - <time >{Tools.FormatDate(item.Created)}</time></strong>
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
            </div>
        )
    }
}
