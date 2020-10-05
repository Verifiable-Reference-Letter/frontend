import React from "react";
import {
  Button,
  Row,
  Container,
  Modal,
  InputGroup,
  Form,
  Card,
  Accordion,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import { Fragment } from "react";

import User from "../common/User.interface";
import UserAuth from "../common/UserAuth.interface";
import LetterDetails from "../common/LetterDetails.interface";
import LetterHistory from "../common/LetterHistory.interface";
import UserProfile from "../common/UserProfile.interface";
import Body from "../common/Body.interface";

import FileView from "../components/FileView";
import FileHistory from "../components/FileHistory";
import Profile from "../components/Profile";
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
  profileIsOpen: boolean;
  historyIsOpen: boolean;
  selectedUserProfile?: UserProfile;
  requestedUser: User[];
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
        {
          letterId: 3,
          writer: {
            name: "Curious George",
            publicAddress: "0x142857142857142857",
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
      profileIsOpen: false,
      historyIsOpen: false,
      requestedUser: [],
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

  closeProfileModal() {
    console.log("closing profile modal");
    this.setState({ profileIsOpen: false });
  }

  openProfileModal(publicAddress: string) {
    console.log("opening profile modal");

    const writer = this.getWriter();
    const fetchUrl = `/api/users/${publicAddress}`;
    this.retrieveProfileFromServer(fetchUrl);
  }

  retrieveProfileFromServer(fetchUrl: string) {
    const init: RequestInit = {
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };

    // get user profile from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`, init)
      .then((response) => {
        response
          .json()
          .then((body: Body) => {
            const data: UserProfile[] = body.data;
            console.log(response);
            this.setState({
              selectedUserProfile: data[0],
              profileIsOpen: true,
            });
          })
          .catch((e: Error) => {
            this.setState({ profileIsOpen: true }); // DELETE
            console.log(e);
          });
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  closeHistoryModal() {
    console.log("closing history modal");
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

  getRequestor() {
    return this.state.letters[this.state.selectedLetterKey]?.requestor;
  }

  getWriter() {
    return this.state.letters[this.state.selectedLetterKey]?.writer;
  }

  render() {
    const { name } = this.props.user;
    const {
      letters,
      history,
      requestIsOpen,
      profileIsOpen,
      historyIsOpen,
      requestedUser,
      selectedLetterId,
    } = this.state;

    const lettersList = letters.map((l, k) => (
      <Card className="full-width opacity-0">
        <Accordion.Toggle
          as={Card.Header}
          className="d-flex"
          eventKey={k.toString()}
        >
          <div className="flex-fill button-blur">
            {/* ({l.letterId}) From {l.writer.name} */}
            <a>From:</a>
            <Button
              variant="outline-light"
              className="ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
                this.openProfileModal(l.writer.publicAddress);
              }}
            >
              {l.writer.name}
            </Button>
          </div>
          <div className="button-blur">
            <Button
              // disabled
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
                this.openHistoryModal(k);
              }}
            >
              History
            </Button>
            <Button
              // disabled
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
                this.openHistoryModal(k);
              }}
            >
              Send
            </Button>
          </div>
        </Accordion.Toggle>
        <Accordion.Collapse as={Card.Body} eventKey={k.toString()}>
          {/* <Card.Body className="">({l.letterId}) {l.writer.name} ({l.writer.publicAddress})</Card.Body> */}
          {/*<div className="acc-body button-blur">
            <a>
              From: 
            </a>
            <Button
              variant="outline-light"
              className="ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
                this.openProfileModal(l.writer.publicAddress);
              }}
            >
              {l.writer.name}
            </Button>
          </div>*/}
          <a className="acc-body display-text float-right">
            Request Date / Upload Date
          </a>
          {/* <Button
              variant="outline-light"
              className="flex-shrink-1 float-right ml-2"
              onClick={(e: any) => {
                e.stopPropagation();
                this.openProfileModal(l.writer.publicAddress);
              }}
            >
              View: {l.writer.name}
            </Button> */}
        </Accordion.Collapse>
      </Card>
    ));

    // const options = range(0, 1000).map((o) => `Item ${o}`);
    const options = this.state.users;

    const request = (
      <Fragment>
        <InputGroup className="d-flex justify-content-between border-radius button-blur mb-0">
          <div
            className="flex-fill mr-4"
            onClick={() => {
              this.setState({ requestedUser: [] });
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
              selected={this.state.requestedUser}
              onChange={(selected) => {
                console.log("selected", selected);
                this.setState({
                  requestedUser: selected,
                });
              }}
              renderMenuItemChildren={
                (option) => `${option.name} (${option.publicAddress})` // TODO: add padding with service
              }
            />
          </div>
          {requestedUser.length !== 0 && (
            <Button
              variant="outline-light"
              className="flex-shrink-1"
              onClick={() => this.openRequestModal()}
            >
              Request
            </Button>
          )}
          {requestedUser.length === 0 && (
            <OverlayTrigger
              overlay={
                <Tooltip id="tooltip-disabled" placement="left">
                  Select An User
                </Tooltip>
              }
            >
              <span className="d-inline-block">
                <Button
                  variant="outline-light"
                  className="flex-shrink-1"
                  disabled
                  style={{ pointerEvents: "none" }}
                  onClick={() => this.openRequestModal()}
                >
                  Request
                </Button>
              </span>
            </OverlayTrigger>
          )}
        </InputGroup>
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
                {requestedUser[0]?.name} ({requestedUser[0]?.publicAddress})
              </span>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body></Modal.Body>
        </Modal>

        <Modal
          id="profile-modal"
          show={profileIsOpen}
          onHide={this.closeProfileModal.bind(this)}
          // backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              User Profile: ({this.state.selectedUserProfile?.name})
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {this.state.selectedUserProfile && (
              <Profile
                user={this.state.selectedUserProfile}
                onClose={this.closeProfileModal.bind(this)}
              />
            )}
          </Modal.Body>
        </Modal>

        <Modal
          id="history-modal"
          show={historyIsOpen}
          onHide={this.closeHistoryModal.bind(this)}
          // backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          size="sm"
        >
          <Modal.Header closeButton>
            <Modal.Title>From {this.getWriter()?.name}</Modal.Title>
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
        </div>
        <hr></hr>
        <div>
          <h3> Request </h3>
          <Card.Header>{request}</Card.Header>
        </div>
        <hr></hr>
        <div className="letters">
          <h3> Letters </h3>
          <Accordion>{lettersList}</Accordion>
        </div>
        <hr></hr>
        <div className="requestor-footer">
          <p> Product of Team Gas</p>
        </div>
      </div>
    );
  }
}
export default Requestor;
