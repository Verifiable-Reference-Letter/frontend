import React from "react";
import { Button, Row, Col } from "react-bootstrap";
import UserAuth from "../../common/User.interface";
import "./Confirm.css";

interface ConfirmProps {
  user: UserAuth;
  onConfirm: () => void;
  onClose: () => void;
}
interface ConfirmState {}

class Confirm extends React.Component<ConfirmProps, ConfirmState> {
  constructor(props: ConfirmProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Col>
        <Row>
          Submit Your Request?
        </Row>
        <Row className="d-flex justify-content-end">
        <Button
          className="mt-3 mr-3 flex-shrink-1"
          onClick={(e: any) => {
            this.props.onConfirm();
          }}
        >
          Confirm
        </Button>
        <Button
          className="mt-3 flex-shrink-1"
          onClick={(e: any) => {
            this.props.onClose();
          }}
        >
          Back
        </Button>
        </Row>
      </Col>
    );
  }
}

export default Confirm;
