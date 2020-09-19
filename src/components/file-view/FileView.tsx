import React from "react";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import User from "../../interfaces/User.interface";
import Letter from "../../interfaces/Letter.interface";
import "./FileView.css";
import SentLetter from "../../interfaces/SentLetter.interface";

interface FileViewProps {
  user: User;
  letter: any;
  onClose: () => void;
}
interface FileViewState {
  letterUrl: any;
}

class FileView extends React.Component<FileViewProps, FileViewState> {
  constructor(props: FileViewProps) {
    super(props);
    this.state = { letterUrl: null };
    let reader = new FileReader();
    reader.readAsDataURL(this.props.letter.contents);
    reader.onload = (e: any) => {
      // console.log(reader.result);
      this.setState({ letterUrl: reader.result });
    };
  }

  getLetterUrl() {}

  render() {
    return (
      <div>
        <div>
          <embed
            type={this.props.letter.contents.type}
            src={this.state.letterUrl}
            width="100%"
            height="100%"
          />
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
