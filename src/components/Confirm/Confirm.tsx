import React from "react";
import { Button, Row, Col, Spinner } from "react-bootstrap";
import UserAuth from "../../common/User.interface";
import "./Confirm.css";

interface ConfirmProps {
  user: UserAuth;
  onConfirm: () => void;
  onClose: () => void;
}
interface ConfirmState {
  confirmed: boolean;
}

class Confirm extends React.Component<ConfirmProps, ConfirmState> {
  constructor(props: ConfirmProps) {
    super(props);
    this.state = {
      confirmed: false,
    };
  }

  render() {
    const { confirmed } = this.state;
    return (
      <Col>
        <Row>Submit Your Request?</Row>
        <Row className="d-flex justify-content-end">
          <div className="mt-3 mr-3">
            {confirmed && <Spinner animation="border" variant="secondary" />}
          </div>
          <Button
            disabled={confirmed}
            className="mt-3 mr-3 flex-shrink-1"
            onClick={(e: any) => {
              this.setState({ confirmed: true });
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
