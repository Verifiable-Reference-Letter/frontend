import React from "react";
import {
  Button,
  Modal,
  InputGroup,
  Card,
  OverlayTrigger,
  Tooltip,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";

import User from "../common/User.interface";
import UserAuth from "../common/UserAuth.interface";
import LetterDetails from "../common/LetterDetails.interface";
import ResponseBody from "../common/ResponseBody.interface";
import Select from "../components/Select";
import RequestorLetterDisplay from "../RequestorLetterDisplay/RequestorLetterDisplay";
import Confirm from "../components/Confirm";
import "./Requestor.css";
import CacheService from "../services/CacheService";

interface RequestorProps {
  user: UserAuth;
}

interface RequestorState {
  users: User[];
  letters: LetterDetails[];
  numRecipients: Number[];
  loadingLetters: boolean;
  dualMode: boolean;
  loadingSelect: boolean;
  selectIsOpen: boolean;
  messageIsOpen: boolean;
  confirmIsOpen: boolean;
  selectedWriter: User[];
  selectedRecipients: User[];
}

class Requestor extends React.Component<RequestorProps, RequestorState> {
  private writerTypeahead = React.createRef<Typeahead<User>>();

  constructor(props: RequestorProps) {
    super(props);
    this.state = {
      users: [],
      letters: [],
      numRecipients: [],
      loadingLetters: true,
      dualMode: false,
      loadingSelect: false,
      selectIsOpen: false,
      messageIsOpen: false,
      confirmIsOpen: false,
      selectedWriter: [],
      selectedRecipients: [],
    };
  }

  componentWillMount() {
    // api call to get users and letters
    // TODO: move users fetch to parent component
    this.loadUsersList();
    this.loadLettersList();
  }

  async loadUsersList() {
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
  }

  async loadLettersList() {
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

    // get letters from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${letterFetchUrl}`, letterInit)
      .then((response) => {
        response
          .json()
          .then((body: ResponseBody) => {
            const data: { letters: LetterDetails[]; numRecipients: Number[] } =
              body.data;
            console.log(response);
            console.log(body.data);
            if (data && data.letters && data.numRecipients) {
              this.setState({
                letters: data.letters,
                numRecipients: data.numRecipients,
                loadingLetters: false,
              });
            } else {
              this.setState({ loadingLetters: false });
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

  async closeSelectModal() {
    console.log("closing select modal");
    this.setState({ selectIsOpen: false, selectedWriter: [], dualMode: false });
  }

  async openSelectModal() {
    console.log("opening select modal");
    if (this.state.selectedWriter.length !== 0) {
      this.setState({
        selectIsOpen: true,
        dualMode: true,
        selectedRecipients: [],
      });
    }
  }

  async onSelectSubmit(customMessage: string) {
    console.log("on select submit");

    // TODO: necessary checks before fetching backend to create new request with letter details and indicated list of recipients
    const fetchUrl = `/api/v1/letters/create`;
    this.sendNewLetterRequestToServer(fetchUrl, customMessage);
  }

  async sendNewLetterRequestToServer(fetchUrl: string, customMessage: string) {
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
        data: {
          selectedRecipients: this.state.selectedRecipients,
          letterWriter: this.state.selectedWriter[0].publicAddress,
          customMessage: customMessage,
        },
      }),
    };

    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`,
        init
      );
      if (response.status === 400) {
        console.log(response.status);
      } else {
        let body = await response.json();
        const data: { letters: LetterDetails[]; numRecipients: Number[] } =
          body.data;
        console.log(response);
        console.log(data);
        if (data) {
          // let l = this.state.letters;
          // l.push(data.letter);

          // let n = this.state.numRecipients;
          // n.push(data.numRecipient);

          this.setState({
            confirmIsOpen: false,
            letters: data.letters,
            numRecipients: data.numRecipients,
            selectIsOpen: false,
            dualMode: false,
            selectedWriter: [],
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  async openMessageModal(selectedRecipients: User[]) {
    this.setState({ selectedRecipients: selectedRecipients });
    this.openConfirmModal();
  }

  async closeMessageModal() {}

  async openConfirmModal() {
    console.log("open confirm modal");
    this.setState({ confirmIsOpen: true });
  }

  async closeConfirmModal() {
    console.log("close confirm modal");
    this.setState({ confirmIsOpen: false });
  }

  render() {
    const user = this.props.user;
    const {
      users,
      letters,
      numRecipients,
      loadingLetters,
      dualMode,
      selectIsOpen,
      messageIsOpen,
      confirmIsOpen,
      selectedWriter,
    } = this.state;

    // const options = range(0, 1000).map((o) => `Item ${o}`);
    const options = this.state.users;

    const selectWriter = (
      <Fragment>
        <InputGroup className="d-flex justify-content-between border-radius button-blur mb-0">
          <div
            className="flex-fill single-typeahead"
            onClick={() => {
              this.setState({ selectedWriter: [] });
            }}
          >
            <Typeahead
              id="select-writer-typeahead"
              // minLength={2}
              labelKey="name"
              filterBy={["name", "publicAddress"]}
              options={options}
              placeholder="Select a Writer"
              paginate={true}
              selected={this.state.selectedWriter}
              onChange={(selected) => {
                console.log("selected", selected);
                this.setState({
                  selectedWriter: selected,
                  selectIsOpen: true,
                  dualMode: true,
                });
              }}
              renderMenuItemChildren={
                (option) =>
                  `${option.name} (${option.publicAddress.slice(0, 6)} . . . )` // TODO: add padding with service
              }
              ref={this.writerTypeahead}
            />
          </div>

          {/* {dualMode && (
            <Button
              variant="outline-light"
              className="ml-4 flex-shrink-1"
              onClick={() => {
                if (selectIsOpen) {
                  this.closeSelectModal();
                } else {
                  this.openSelectModal();
                }
              }}
            >
              {selectIsOpen ? "Close" : "Select"}
            </Button>
          )} */}

          {/* {selectedWriter.length !== 0 && (
            <Button
              variant="outline-light"
              className="flex-shrink-1"
              onClick={() => {
                if (selectIsOpen) {
                  this.closeSelectModal();
                } else {
                  this.openSelectModal();
                }
              }}
            >
              {selectIsOpen ? "Close" : "Select"}
            </Button>
          )} */}

          {/* {selectedWriter.length === 0 && (
            <OverlayTrigger
              overlay={
                <Tooltip id="tooltip-disabled">
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
                  onClick={() => {
                    if (selectIsOpen) {
                      this.closeSelectModal();
                    } else {
                      this.openSelectModal();
                    }
                  }}
                >
                  {selectIsOpen ? "Close" : "Select"}
                </Button>
              </span>
            </OverlayTrigger>
          )} */}
        </InputGroup>
      </Fragment>
    );

    const lettersList = letters.map((l, k) => (
      <RequestorLetterDisplay
        user={user}
        letter={l}
        numRecipients={numRecipients[k]}
        users={users}
      />
    ));

    const requestorSelect = (
      <div className="requestor-select">
        <div className="requestor-header">
          <h3 className="mb-3">New Request</h3>
        </div>
        <Card.Header className="requestor-select-writer">
          <div>{selectWriter}</div>
        </Card.Header>
        {selectIsOpen && selectedWriter.length === 1 && (
          <div className="collapse-body-select">
            <Select
              user={this.props.user}
              previouslySelectedRecipients={[]}
              header="Select Recipients"
              onClose={this.closeSelectModal.bind(this)}
              onSubmit={this.openMessageModal.bind(this)}
              users={this.state.users.filter(
                (user: User) =>
                  user.publicAddress !== selectedWriter[0].publicAddress
              )}
            />
          </div>
        )}
      </div>
    );

    const requestorLetter = (
      <div className="requestor-letters">
        <h3> {letters.length !== 0 ? "Requests" : ""} </h3>
        <div className="requestor-letterslist">{lettersList}</div>
      </div>
    );

    const requestorFooter = (
      <div className="requestor-footer button-blur-no-border text-white-50">
        <span> Product of Team Gas</span>
        <Button
          variant="outline-light"
          onClick={() => {
            this.setState({ letters: [], loadingLetters: true });
            this.loadLettersList();
          }}
        >
          <FontAwesomeIcon icon={faSync} />
        </Button>
      </div>
    );

    return (
      <>
        {!loadingLetters && letters.length === 0 && (
          <Col className="requestor">
            <Row>{requestorSelect}</Row>
            <Row>{requestorFooter}</Row>
          </Col>
        )}

        {!loadingLetters && !dualMode && letters.length !== 0 && (
          <Col className="requestor">
            <Row>{requestorSelect}</Row>
            <Row>{requestorLetter}</Row>
            <Row>{requestorFooter}</Row>
          </Col>
        )}

        {!loadingLetters && dualMode && letters.length !== 0 && (
          <Col className="requestor-dual">
            <Row>
              <Col className="ml-5 mr-5">
                <Row>{requestorSelect}</Row>
                {/* <Row>{requestorFooter}</Row> */}
              </Col>
              <Col className="mr-5 ml-5">
                <Row>{requestorLetter}</Row>
                {/* <Row>{requestorFooter}</Row> */}
              </Col>
            </Row>
            <Row>{requestorFooter}</Row>
          </Col>
        )}

        {loadingLetters && (
          <div className="d-flex justify-content-center absolute-center">
            <Spinner className="" animation="border" variant="secondary" />
          </div>
        )}

        <Modal
          id="confirm-modal"
          show={confirmIsOpen}
          onHide={this.closeConfirmModal.bind(this)}
          // backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          // size="xl"
        >
          <Modal.Header closeButton>
            <Modal.Title>Please Confirm</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Confirm
              user={this.props.user}
              custom={true}
              onConfirm={this.onSelectSubmit.bind(this)}
              onClose={this.closeConfirmModal.bind(this)}
            />
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
export default Requestor;
