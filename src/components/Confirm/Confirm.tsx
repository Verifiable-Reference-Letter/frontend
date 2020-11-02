import React from "react";
import { Button, Row, Col, Spinner, Form } from "react-bootstrap";
import UserAuth from "../../common/UserAuth.interface";
import "./Confirm.css";

interface ConfirmProps {
  user: UserAuth;
  custom: boolean;
  onConfirm: (customMessage: string) => void;
  onClose: () => void;
}
interface ConfirmState {
  confirmed: boolean;
  customMessage: string;
}

class Confirm extends React.Component<ConfirmProps, ConfirmState> {
  constructor(props: ConfirmProps) {
    super(props);
    this.state = {
      confirmed: false,
      customMessage: "",
    };
  }

  async handleMessageChange(event: any) {
    const customMessage: string = event.target.value;
    console.log(customMessage);
    this.setState({ customMessage: customMessage });
  }

  render() {
    const { custom } = this.props;
    const { confirmed } = this.state;
    return (
      <Col>
        {!custom && (<Row>Submit Your Request?</Row>)}
        {custom && (<Row>
          <Form.Group controlId="custom-message" className="w-100">
            <Form.Label>Optional Custom Message</Form.Label>
            <Form.Control
              type="text"
              placeholder="Type here . . . "
              onChange={this.handleMessageChange.bind(this)}
            />
            <Form.Text className="text-muted">
              This will be visible in the email notification.
            </Form.Text>
          </Form.Group>
        </Row>)}
        <Row className="d-flex justify-content-end">
          <div className="mt-3 mr-3">
            {confirmed && <Spinner animation="border" variant="secondary" />}
          </div>
          <Button
            disabled={confirmed}
            className="mt-3 mr-3 flex-shrink-1"
            onClick={(e: any) => {
              this.setState({ confirmed: true });
              this.props.onConfirm(this.state.customMessage);
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
