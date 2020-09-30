import React from "react";
import { Container, Row, Button } from "react-bootstrap";
import "./FileHistory.css";
import LetterHistory from "../../common/LetterHistory.interface";

interface FileHistoryProps {
  history: LetterHistory[];
  onClose: () => void;
}
interface FileHistoryState {
}

class FileHistory extends React.Component<FileHistoryProps, FileHistoryState> {
  componentWillMount() {
  }

  constructor(props: FileHistoryProps) {
    super(props);
    this.state = { letterUrl: null, letterType: "" };
  }

  /*decryptLetter(letter: string) {
    console.log("decrypting letter");
    return new File([""], "filename.pdf", {type: "application/pdf"});
  }*/

  render() {
    const { history } = this.props;
    const historyList = history.map((l, k) => (
      <Row key={k}>
        <div className="full-width">
          <span className="text-float-left">({l.letterId})&nbsp;</span>
          <span className="text-float-left">Sent to: {l.recipient.name}</span>
          <Button
            // variant="secondary"
            className="left-float-right-button"
            onClick={() => {
            }}
          >
          View
          </Button>
        </div>
      </Row>
    ));

    return (
      <div>
        <Container fluid>
          {historyList}
        </Container>
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

export default FileHistory;
