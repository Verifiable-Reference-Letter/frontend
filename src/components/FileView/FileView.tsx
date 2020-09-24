import React from "react";
import Button from "react-bootstrap/Button";
import User from "../../common/UserAuth.interface";
import "./FileView.css";

interface FileViewProps {
  user: User;
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
    return (
      <div>
        <div>
          {this.props.file && (
            <embed
              type={this.state.letterType}
              src={this.state.letterUrl}
              width="100%"
              height="400px"
            />
          )}
        </div>
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
