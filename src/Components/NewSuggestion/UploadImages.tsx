import * as React from "react";
import { Row, Col } from "react-bootstrap";
import { DataAdapter } from "../Common/DataAdapter";

interface UploadImagesProps { onDataUpdate?(pictureURL: string): void }
interface UploadImagesState { uploadedImageUrl: string }
export class UploadImages extends React.Component<UploadImagesProps, UploadImagesState>
{
    state = { uploadedImageUrl: "" };
    uploadImage(val: any) {
        var el: any = $("#fileUpload")[0];
        var file = el.files[0];
        var da = new DataAdapter();
        da.uploadImage(file, file.name).then((r: any) => {
            var picUrl = _spPageContextInfo.webAbsoluteUrl + "/Bilder/" + file.name
            this.setState({ uploadedImageUrl: picUrl }, () => {
                this.props.onDataUpdate(picUrl);
            })
        });
    }
    render() {
        var uploadedImg = this.state.uploadedImageUrl;
        return (
            <Row>
                <Col xs={12}>
                    <div className="form-area">
                        {(uploadedImg.length > 0) ? <img src={uploadedImg} width={500} /> : ""}
                        <strong className="title">Bilde (valgfritt)</strong>
                        <p>Bildet må være mindre enn 1.5 Mb, og av typen .png, .jpg eller .gif</p>
                        <input type="file"
                            style={{ height: 0, overflow: "hidden", position: "absolute", top: "-10000px" }}
                            id="fileUpload"
                            onChange={this.uploadImage.bind(this)} />
                        <a href="#" className="btn" onClick={() => { $("#fileUpload").click() }} >Velg bilder</a>
                    </div>
                </Col>
            </Row>
        )
    }
}