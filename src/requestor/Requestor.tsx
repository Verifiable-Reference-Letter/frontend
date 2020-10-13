import React from "react";
import {
  Button,
  Modal,
  InputGroup,
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
import RequestBody from "../common/RequestBody.interface";
import ResponseBody from "../common/ResponseBody.interface";

import FileView from "../components/FileView";
import FileHistory from "../components/FileHistory";
import Profile from "../components/Profile";
import Select from "../components/Select";
import "./Requestor.css";

interface RequestorProps {
  user: UserAuth;
}

interface RequestorState {
  users: User[];
  letters: LetterDetails[];
  history: LetterHistory[];
  letterKey: number;
  selectIsOpen: boolean;
  profileIsOpen: boolean;
  historyIsOpen: boolean;
  selectedUserProfile?: UserProfile;
  requestedWriter: User[];
  previouslySelectedRecipients: User[];
  selectedLetterKey: number;
  selectedLetterId: string;
}

class Requestor extends React.Component<RequestorProps, RequestorState> {
  private viewModal = React.createRef<FileView>();

  componentWillMount() {
    // api call to get users and letters

    const userFetchUrl = `/api/v1/users`;
    const userInit: RequestInit = {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth: {
          jwtToken: this.props.user.jwtToken,
          publicAddress: this.props.user.publicAddress,
        },
        data: {},
      }),
    };

    // get user profile from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${userFetchUrl}`, userInit)
      .then((response) => {
        response
          .json()
          .then((body: ResponseBody) => {
            const data: User[] = body.data;
            console.log(response);
            console.log(body.data);
            if (data) {
              this.setState({
                users: data,
              });
            } else {
              console.log("problem with response data for requestor");
            }
          })
          .catch((e: Error) => {
            console.log(e);
          });
      })
      .catch((e: Error) => {
        console.log(e);
      });

    const letterFetchUrl = `/api/v1/letters/requested`;
    const letterInit: RequestInit = {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth: {
          jwtToken: this.props.user.jwtToken,
          publicAddress: this.props.user.publicAddress,
        },
        data: {},
      }),
    };

    // get user profile from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${letterFetchUrl}`, letterInit)
      .then((response) => {
        response
          .json()
          .then((body: ResponseBody) => {
            const data: LetterDetails[] = body.data;
            console.log(response);
            console.log(body.data);
            if (data) {
              this.setState({
                letters: data,
              });
            } else {
              console.log("problem with response data for requestor");
            }
          })
          .catch((e: Error) => {
            console.log(e);
          });
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  constructor(props: RequestorProps) {
    super(props);
    this.state = {
      users: [],
      letters: [],
      history: [],
      letterKey: -1,
      selectIsOpen: false,
      profileIsOpen: false,
      historyIsOpen: false,
      requestedWriter: [],
      previouslySelectedRecipients: [],
      selectedLetterKey: -1,
      selectedLetterId: "",
    };
  }

  closeSelectModal() {
    console.log("closing select modal");
    this.setState({ selectIsOpen: false });
  }

  openSelectModal() {
    console.log("opening select modal");
    this.setState({
      previouslySelectedRecipients: [],
      selectIsOpen: true,
    });
  }

  async onRequestSubmit(requestedRecipients: User[]) {
    console.log("on request submit");
    console.log(requestedRecipients);

    // TODO: fetch backend to create new request
    this.setState({
      selectIsOpen: false,
    });
  }

  async onSendSubmit(requestedRecipients: User[]) {
    console.log("on send submit");

    // TODO: fetch backend to update recipients list (more complex sql)
    this.setState({
      selectIsOpen: false,
    });
  }

  async onSendClick(letterId: string) {
    console.log("on send click");
    // fetch backend to get recipients list (who the letter has not been sent to)
    const fetchUrl = `/api/letters/${letterId}/`;
    const previousSelectedRecipients = await this.retrieveRecipientsFromServer();
    this.setState({
      previouslySelectedRecipients: previousSelectedRecipients,
      requestedWriter: [],
      selectIsOpen: true,
    });
  }

  async retrieveRecipientsFromServer(): Promise<User[]> {
    return [
      {
        name: "Peanut Butter",
        publicAddress: "0xweojsdkfojo1291029i31092kofjdsd",
      },
    ];
  }

  closeProfileModal() {
    console.log("closing profile modal");
    this.setState({ profileIsOpen: false });
  }

  openProfileModal(publicAddress: string) {
    console.log("opening profile modal");
    const fetchUrl = `/api/v1/users/${publicAddress}/profile`;
    this.retrieveProfileFromServer(fetchUrl);
  }

  retrieveProfileFromServer(fetchUrl: string) {
    const init: RequestInit = {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth: {
          jwtToken: this.props.user.jwtToken,
          publicAddress: this.props.user.publicAddress,
        },
        data: {},
      }),
    };

    // get user profile from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`, init)
      .then((response) => {
        response
          .json()
          .then((body: ResponseBody) => {
            const data: UserProfile[] = body.data;
            console.log(response);
            console.log(data);
            if (data && data.length !== 0) {
              this.setState({
                selectedUserProfile: data[0],
                profileIsOpen: true,
              });
            }
          })
          .catch((e: Error) => {
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
    const letterId = this.state.letters[key].letterId;
    this.setState({
      selectedLetterKey: key,
      selectedLetterId: letterId,
    });
    // const fetchUrl = `/api/v1/users/${this.props.user.publicAddress}/letters/${letterId}/history`;
    const fetchUrl = `/api/v1/letters/${letterId}/history`;

    this.retrieveHistoryFromServer(fetchUrl);
  }

  retrieveHistoryFromServer(fetchUrl: string) {
    const init: RequestInit = {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth: {
          jwtToken: this.props.user.jwtToken,
          publicAddress: this.props.user.publicAddress,
        },
        data: {},
      }),
    };

    // get user profile from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`, init)
      .then((response) => {
        response
          .json()
          .then((body: ResponseBody) => {
            const data: LetterHistory[] = body.data;
            console.log(response);
            console.log(data);
            if (data) {
              this.setState({
                history: data,
                historyIsOpen: true,
              });
            } else {
              console.log("fetch for letterHistory failed");
            }
          })
          .catch((e: Error) => {
            console.log(e);
          });
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  getRequestor() {
    return this.state.letters[this.state.selectedLetterKey]?.letterRequestor;
  }

  getWriter() {
    return this.state.letters[this.state.selectedLetterKey]?.letterWriter;
  }

  render() {
    const user = this.props.user;
    const {
      letters,
      history,
      selectIsOpen,
      profileIsOpen,
      historyIsOpen,
      requestedWriter,
    } = this.state;

    const lettersList = letters.map((l, k) => (
      <Card className="full-width opacity-0">
        <Accordion.Toggle
          as={Card.Header}
          className="d-flex"
          eventKey={k.toString()}
        >
          <div className="flex-fill button-blur">
            <span className="mr-3">From:</span>
            <Button
              variant="outline-light"
              onClick={(e: any) => {
                e.stopPropagation();
                this.openProfileModal(l.letterWriter.publicAddress);
              }}
            >
              {l.letterWriter?.name}
            </Button>
          </div>
          <div className="button-blur">
            <Button
              disabled={l.uploadedAt === null}
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
              // TODO: add Tooltip
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
                this.onSendClick(l.letterId);
              }}
            >
              {l.uploadedAt ? "Send" : "Edit"}
            </Button>
            {/* {!l.uploadedAt && (
              <div className="display-text flex-shrink-1 float-right">
                Pending
              </div>
            )} */}
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
          <div className="acc-body display-text d-flex">
            <div className="flex-fill">
              Requested: {l.requestedAt?.toString()}
            </div>
            {l.uploadedAt && (
              <div className=" flex-shrink-1 float-right">
                Uploaded: {l.uploadedAt?.toString()}
              </div>
            )}
            {!l.uploadedAt && (
              <div className=" flex-shrink-1 float-right">Not Uploaded</div>
            )}
          </div>
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

    const requestWriter = (
      <Fragment>
        <InputGroup className="d-flex justify-content-between border-radius button-blur mb-0">
          <div
            className="flex-fill mr-4 single-typeahead"
            onClick={() => {
              this.setState({ requestedWriter: [] });
            }}
          >
            <Typeahead
              id="request-writer"
              // minLength={2}
              labelKey="name"
              filterBy={["name", "publicAddress"]}
              options={options}
              placeholder="Select a User"
              paginate={true}
              selected={this.state.requestedWriter}
              onChange={(selected) => {
                console.log("selected", selected);
                this.setState({
                  requestedWriter: selected,
                });
              }}
              renderMenuItemChildren={
                (option) => `${option.name} (${option.publicAddress})` // TODO: add padding with service
              }
            />
          </div>
          {requestedWriter.length !== 0 && (
            <Button
              variant="outline-light"
              className="flex-shrink-1"
              onClick={() => this.openSelectModal()}
            >
              Request
            </Button>
          )}
          {requestedWriter.length === 0 && (
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
                  onClick={() => this.openSelectModal()}
                >
                  Request
                </Button>
              </span>
            </OverlayTrigger>
          )}
        </InputGroup>
      </Fragment>
    );

    // const requestRecipients = (
    //   <Fragment>
    //     <InputGroup className="d-flex justify-content-between border-radius button-blur mb-0">
    //       <div className="flex-fill multiple-typeahead">
    //         <Typeahead
    //           id="request-recipients"
    //           // minLength={2}
    //           multiple
    //           labelKey="name"
    //           filterBy={["name", "publicAddress"]}
    //           options={options}
    //           placeholder="Select a User"
    //           paginate={true}
    //           selected={this.state.requestedRecipients}
    //           onChange={(selected) => {
    //             console.log("selected", selected);
    //             this.setState({
    //               requestedRecipients: selected,
    //             });
    //           }}
    //           renderMenuItemChildren={
    //             (option) => `${option.name} (${option.publicAddress})` // TODO: add padding with service
    //           }
    //         />
    //       </div>
    //     </InputGroup>
    //   </Fragment>
    // );

    return (
      <div className="requestor">
        <Modal
          id="select-modal"
          show={selectIsOpen}
          onHide={this.closeSelectModal.bind(this)}
          backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <span>
                From: {requestedWriter[0]?.name}
                {/* ({requestedWriter[0]?.publicAddress}) */}
              </span>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Select
              user={this.props.user}
              previouslySelectedRecipients={
                this.state.previouslySelectedRecipients
              }
              onClose={this.closeSelectModal.bind(this)}
              onSubmit={
                this.state.requestedWriter.length !== 0
                  ? this.onRequestSubmit.bind(this)
                  : this.onSendSubmit.bind(this)
              }
              users={this.state.users}
            ></Select>
          </Modal.Body>
        </Modal>

        <Modal
          id="profile-modal"
          show={profileIsOpen}
          onHide={this.closeProfileModal.bind(this)}
          // backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          size="sm"
        >
          <Modal.Header closeButton>
            <Modal.Title>{this.state.selectedUserProfile?.name}</Modal.Title>
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
            <Modal.Title>From: {this.getWriter()?.name}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FileHistory
              user={user}
              history={history}
              onClose={this.closeHistoryModal.bind(this)}
            ></FileHistory>
          </Modal.Body>
        </Modal>

        <div className="requestor-header">
          <h1> Requestor Page </h1>
          <p>
            <em>{user.name}</em>
          </p>
        </div>
        <hr></hr>

        <div>
          <h3> Request </h3>
          <Card.Header>{requestWriter}</Card.Header>
          {/* <Card.Header>{requestRecipients}</Card.Header> */}
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
