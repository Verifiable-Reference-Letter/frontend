import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import User from "../../interfaces/User.interface";
import "./FileView.css";

interface FileViewProps {
  user: User;
  onClose: () => void;
}
interface FileViewState {
}

class FileView extends React.Component<FileViewProps, FileViewState> {
  constructor(props: FileViewProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        FileView
      </div>
    );
  }
}

export default FileView;
