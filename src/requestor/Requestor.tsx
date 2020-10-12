import React from "react";
import {
  Button,
  Modal,
  InputGroup,
  Card,
  Accordion,
  OverlayTrigger,
  Tooltip,
  FormGroup,
  Form,
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
import Request from "../components/Request";
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
  requestedWriter: User[];
  requestedRecipients: User[];
  selectedLetterKey: number;
  selectedLetterId: number;
}

class Requestor extends React.Component<RequestorProps, RequestorState> {
  private viewModal = React.createRef<FileView>();

  componentWillMount() {
    // api call to get users and letters
    // TODO: fetch all users for request typeahead

    const letterFetchUrl = `/api/v1/letters/requested`;
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
    fetch(`${process.env.REACT_APP_BACKEND_URL}${letterFetchUrl}`, init)
      .then((response) => {
        response
          .json()
          .then((body: Body) => {
            const data: LetterDetails[] = body.data;
            console.log(response);
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

    this.setState({
      users: [
        { name: "Mary Poppins", publicAddress: "0x314159265358979323" },
        { name: "Elton John", publicAddress: "0x101100101001101110100" },
        { name: "Curious George", publicAddress: "0x142857142857142857" },
        { name: "Jerry Mouse", publicAddress: "0xqwertyuiopasdfghjkl" },
        { name: "Tom Cat", publicAddress: "qazwsxedcrfvtgbyhnujmi" },
        { name: "Jane Eyre", publicAddress: "0x1q2w3e4r5t6y7u8i9o0p" },
        { name: "The Grinch", publicAddress: "0xuioghj567xcvtyu89" },
        {
          name: "Eponine Thenardier",
          publicAddress: "0xtrfdxzmlkpoiujhnbytgfvc",
        },
        { name: "Little Prince", publicAddress: "0xm98nb76vc54xz32aq1" },
        { name: "Winston Smith", publicAddress: "0x30dk49fj58ghuty7610" },
        { name: "Michael Cassio", publicAddress: "0xp098uhhbvfr43wazxd" },
        { name: "Buddy Hobbs", publicAddress: "0x10woskdjrutyghvbcnxm" },
        { name: "Remy Rat", publicAddress: "0xplkio098ujmnhy76tgb" },
        { name: "Ron Swanson", publicAddress: "0xghvbnjuytfcdresx5678olk" },
        { name: "David Tennant", publicAddress: "0xpsodkrmvnxjsiqo20fh48" },
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
          requestedAt: null,
          uploadedAt: null,
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
          requestedAt: null,
          uploadedAt: null,
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
          requestedAt: null,
          uploadedAt: null,
          recipient: {
            name: "Elton John",
            publicAddress: "0x101100101001101110100",
          },
          sentAt: null,
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
          requestedAt: null,
          uploadedAt: null,
          recipient: {
            name: "Curious George",
            publicAddress: "0x142857142857142857",
          },
          sentAt: null,
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
      requestedWriter: [],
      requestedRecipients: [],
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

  async onSelectSubmit(requestedRecipients: User[]) {
    console.log("on select submit");
    console.log(requestedRecipients);

    // TODO: CALL TO BACKEND

    this.setState({
      requestIsOpen: false,
    });
  }

  closeProfileModal() {
    console.log("closing profile modal");
    this.setState({ profileIsOpen: false });
  }

  openProfileModal(publicAddress: string) {
    console.log("opening profile modal");

    const writer = this.getWriter();
    const fetchUrl = `/api/v1/users/${publicAddress}`;
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
          .then((body: Body) => {
            const data: UserProfile[] = body.data;
            console.log(response);
            if (data) {
              this.setState({
                selectedUserProfile: data[0],
                profileIsOpen: true,
              });
            } else {
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
      historyIsOpen: true,
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
          .then((body: Body) => {
            const data: LetterHistory[] = body.data;
            console.log(response);
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
      requestedWriter,
      requestedRecipients,
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
            <a className="mr-3">From:</a>
            <Button
              variant="outline-light"
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
              disabled
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
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
              onClick={() => this.openRequestModal()}
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
          id="request-modal"
          show={requestIsOpen}
          onHide={this.closeRequestModal.bind(this)}
          backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <span>
                {requestedWriter[0]?.name}
                {/* ({requestedWriter[0]?.publicAddress}) */}
              </span>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Request
              onClose={this.closeRequestModal.bind(this)}
              onSubmit={this.onSelectSubmit.bind(this)}
              users={this.state.users}
            ></Request>
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
            <Modal.Title>({this.state.selectedUserProfile?.name})</Modal.Title>
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
