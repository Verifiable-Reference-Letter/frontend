import React from "react";
import { Button, ListGroup, Table } from "react-bootstrap";
import LetterDetails from "../../common/LetterDetails.interface";
import "./FileView.css";

interface FileViewProps {
  letter: LetterDetails;
  file?: File;
  onClose: () => void;
}
interface FileViewState {
  letterUrl: any;
  letterType: string;
}

class FileView extends React.Component<FileViewProps, FileViewState> {
  componentWillMount() {
    const file = this.props.file;
    let reader = new FileReader();
    if (file !== undefined) {
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        this.setState({ letterUrl: reader.result, letterType: file.type });
      };
      console.log("letterUrl", this.state.letterUrl);
    }
  }

  constructor(props: FileViewProps) {
    super(props);
    this.state = { letterUrl: null, letterType: "" };
  }

  /*decryptLetter(letter: string) {
    console.log("decrypting letter");
    return new File([""], "filename.pdf", {type: "application/pdf"});
  }*/

  render() {
    const { letter, file } = this.props;
    const requestor = letter.requestor;
    const writer = letter.writer;
    const { letterUrl, letterType } = this.state;
    return (
      <div>
        <div className="mb-3">
          {file && (
            <embed
              type={letterType}
              src={letterUrl}
              width="100%"
              height="360px"
            />
          )}
        </div>

        <Table hover className="border border-secondary">
          <thead>
            <tr>
              <th className="border border-secondary .bg-secondary">Letter ID</th>
              <th className="border border-secondary">Requestor</th>
              <th className="border border-secondary">Writer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-secondary">{letter.letterId}</td>
              <td className="border border-secondary">
                {requestor.name} ({requestor.publicAddress})
              </td>
              <td className="border border-secondary">
                {writer.name} ({writer.publicAddress})
              </td>
            </tr>
          </tbody>
        </Table>

        <Button
          className="form-button"
          onClick={(e: any) => {
            this.props.onClose();
          }}
        >
          Close
        </Button>
      </div>
    );
  }
}

export default FileView;
