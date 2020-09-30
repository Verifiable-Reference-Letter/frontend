import React from "react";
import {
  Button,
  Row,
  Container,
  Modal,
  InputGroup,
  Form,
} from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import { Fragment } from "react";

import User from "../common/User.interface";
import UserAuth from "../common/UserAuth.interface";
import LetterDetails from "../common/LetterDetails.interface";
import LetterHistory from "../common/LetterHistory.interface";
import FileView from "../components/FileView";
import FileHistory from "../components/FileHistory";
import "./Requestor.css";

interface RequestorProps {
  user: UserAuth;
}

interface RequestorState {
  users: User[];
  letters: LetterDetails[];
  history: LetterHistory[];
  letterKey: number;
  requestIsOpen: boolean;
  viewIsOpen: boolean;
  historyIsOpen: boolean;
  selectedUser: User[];
  selectedLetterKey: number;
  selectedLetterId: number;
}

class Requestor extends React.Component<RequestorProps, RequestorState> {
  private viewModal = React.createRef<FileView>();

  componentWillMount() {
    // api call to get users and letters
    this.setState({
      users: [
        { name: "Mary Poppins", publicAddress: "0x314159265358979323" },
        { name: "Elton John", publicAddress: "0x101100101001101110100" },
        { name: "Curious George", publicAddress: "0x142857142857142857" },
      ],
      letters: [
        {
          letterId: 1,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
          },
          requestor: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
          },
        },
      ],
      history: [
        {
          letterId: 1,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
          },
          requestor: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
          },
          recipient: {
            name: "Elton John",
            publicAddress: "0x101100101001101110100",
          },
        },
        {
          letterId: 1,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
          },
          requestor: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
          },
          recipient: {
            name: "Curious George",
            publicAddress: "0x142857142857142857",
          },
        },
      ],
    });
  }

  constructor(props: RequestorProps) {
    super(props);
    this.state = {
      users: [],
      letters: [],
      history: [],
      letterKey: -1,
      requestIsOpen: false,
      viewIsOpen: false,
      historyIsOpen: false,
      selectedUser: [],
      selectedLetterKey: -1,
      selectedLetterId: -1,
    };
  }

  closeRequestModal() {
    console.log("closing request modal");
    this.setState({ requestIsOpen: false });
  }

  openRequestModal() {
    console.log("opening request modal");
    this.setState({
      requestIsOpen: true,
    });
  }

  closeViewModal() {
    console.log("closing view modal");
    this.setState({ viewIsOpen: false });
  }

  openViewModal(key: number) {
    console.log("opening view modal");

    this.setState({
      viewIsOpen: true,
      selectedLetterKey: key,
      selectedLetterId: this.state.letters[key].letterId,
    });
  }

  closeHistoryModal() {
    console.log("closing view modal");
    this.setState({ historyIsOpen: false });
  }

  openHistoryModal(key: number) {
    console.log("opening history modal");
    this.setState({
      historyIsOpen: true,
      selectedLetterKey: key,
      selectedLetterId: this.state.letters[key].letterId,
    });
  }

  getUserName() {
    return this.state.letters[this.state.selectedLetterKey]?.requestor.name;
  }

  render() {
    const { name } = this.props.user;
    const {
      letters,
      history,
      requestIsOpen,
      viewIsOpen,
      historyIsOpen,
      selectedUser,
      selectedLetterId,
    } = this.state;

    const lettersList = letters.map((l, k) => (
      <Row key={k}>
        <div className="full-width">
          <span className="text-float-left">({l.letterId})&nbsp;</span>
          <span className="text-float-left">From: {l.writer.name}</span>
          <Button
            className="left-float-right-button"
            onClick={() => {
              this.openHistoryModal(k);
            }}
          >
            History
          </Button>
          <Button
            className="left-float-right-button"
            onClick={() => {
              this.openViewModal(k);
            }}
          >
            View
          </Button>
        </div>
      </Row>
    ));

    // const options = range(0, 1000).map((o) => `Item ${o}`);
    const options = this.state.users;

    const request = (
      <Fragment>
        <Form.Group>
          <InputGroup className="d-flex justify-content-between border-radius">
            <div
              className="flex-fill mr-4"
              onClick={() => {
                this.setState({ selectedUser: [] });
              }}
            >
              <Typeahead
                id="basic-behaviors-example"
                // minLength={2}
                labelKey="name"
                filterBy={["name", "publicAddress"]}
                options={options}
                placeholder="Select a User"
                paginate={true}
                selected={this.state.selectedUser}
                onChange={(selected) => {
                  console.log("selected", selected);
                  this.setState({
                    selectedUser: selected,
                  });
                }}
                renderMenuItemChildren={
                  (option) => `${option.name} (${option.publicAddress})` // TODO: add padding with service
                }
              />
            </div>
            <Button
              className="flex-shrink-1"
              disabled={selectedUser.length === 0}
              onClick={() => this.openRequestModal()}
            >
              Request
            </Button>
          </InputGroup>
        </Form.Group>
      </Fragment>
    );

    return (
      <div className="requestor">
        <Modal
          id="request-modal"
          show={requestIsOpen}
          onHide={this.closeRequestModal.bind(this)}
          backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          size="sm"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <span>
                {selectedUser[0]?.name} ({selectedUser[0]?.publicAddress})
              </span>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body></Modal.Body>
        </Modal>

        <Modal
          id="view-modal"
          show={viewIsOpen}
          onHide={this.closeViewModal.bind(this)}
          backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {this.getUserName()} ({selectedLetterId})
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FileView
              ref={this.viewModal}
              letter={letters[this.state.selectedLetterKey]}
              onClose={this.closeViewModal.bind(this)}
            ></FileView>
          </Modal.Body>
        </Modal>

        <Modal
          id="history-modal"
          show={historyIsOpen}
          onHide={this.closeHistoryModal.bind(this)}
          backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          size="sm"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {this.getUserName()} ({selectedLetterId})
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FileHistory
              history={history}
              onClose={this.closeHistoryModal.bind(this)}
            ></FileHistory>
          </Modal.Body>
        </Modal>

        <div className="requestor-header">
          <h1> Requestor Page </h1>
          <p>
            <em>{name}</em>
          </p>
          <hr></hr>
        </div>

        <div>
          <h3> Request </h3>
          {request}
          <hr></hr>
        </div>

        <div className="letters">
          <h3> Letters </h3>
          <Container fluid>{lettersList}</Container>
          <hr></hr>
        </div>

        <div className="requestor-footer">
          <p> Product of Team Gas</p>
        </div>
      </div>
    );
  }
}
export default Requestor;
