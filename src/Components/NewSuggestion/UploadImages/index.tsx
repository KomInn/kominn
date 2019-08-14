import * as React from "react";
import { DataAdapter } from "../../../Data/DataAdapter";
import { Label } from "office-ui-fabric-react/lib/Label";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import { IUploadImagesProps } from "./IUploadImagesProps";
import { IUploadImagesState } from "./IUploadImagesState";

export class UploadImages extends React.Component<IUploadImagesProps, IUploadImagesState>
{
    private dataAdapter = new DataAdapter();

    constructor(props: IUploadImagesProps) {
        super(props);
        this.state = {};
    }

    @autobind
    uploadImage() {
        var el: any = $("#fileUpload")[0];
        var [file] = el.files;
        this.dataAdapter.uploadImage(file, file.name).then(_ => {
            var uploadedImageUrl = _spPageContextInfo.webAbsoluteUrl + "/Bilder/" + file.name
            this.setState({ uploadedImageUrl });
            this.props.onDataUpdate(uploadedImageUrl);
        });
    }
    render() {
        return (
            <section>
                <Label>Bilde (valgfritt)</Label>
                {this.state.uploadedImageUrl && <img src={this.state.uploadedImageUrl} width={500} />}
                <p>Bildet må være mindre enn 1.5 Mb, og av typen .png, .jpg eller .gif</p>
                <input type="file" style={{ height: 0, overflow: "hidden", position: "absolute", top: "-10000px" }} id="fileUpload" onChange={this.uploadImage} />
                <DefaultButton text="Velg bilde" onClick={_ => $("#fileUpload").click()} />
            </section>
        )
    }
}