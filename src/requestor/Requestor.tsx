import React from "react";
import {
  Button,
  Modal,
  InputGroup,
  Card,
  Accordion,
  OverlayTrigger,
  Tooltip,
  Spinner,
  Row,
  Col,
  Container,
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
import LetterDisplay from "../LetterDisplay";
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
  loadingSelect: boolean;
  selectIsOpen: boolean;
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
      loadingSelect: false,
      selectIsOpen: false,
      selectedWriter: [],
      selectedRecipients: [],
    };
  }

  componentWillMount() {
    // api call to get users and letters
    // TODO: move users fetch to parent component
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
            if (data) {
              this.setState({
                letters: data.letters,
                numRecipients: data.numRecipients,
                loadingLetters: false,
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

  async closeSelectModal() {
    console.log("closing select modal");
    this.setState({ selectIsOpen: false, selectedRecipients: [] });
  }

  async openSelectModal() {
    console.log("opening select modal");
    this.setState({
      selectIsOpen: true,
    });
  }

  async onSelectSubmit() {
    console.log("on select submit");

    // TODO: fetch backend to create new request with indicated list of recipients

    this.setState({
      selectIsOpen: false,
    });
  }

  render() {
    const user = this.props.user;
    const {
      users,
      letters,
      numRecipients,
      loadingLetters,
      selectIsOpen,
      selectedWriter,
    } = this.state;

    // const options = range(0, 1000).map((o) => `Item ${o}`);
    const options = this.state.users;

    const selectWriter = (
      <Fragment>
        <InputGroup className="d-flex justify-content-between border-radius button-blur mb-0">
          <div
            className="flex-fill mr-4 single-typeahead"
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
                });
              }}
              renderMenuItemChildren={
                (option) =>
                  `${option.name} (${option.publicAddress.slice(0, 6)} . . . )` // TODO: add padding with service
              }
              ref={this.writerTypeahead}
            />
          </div>

          {selectedWriter.length !== 0 && (
            <Button
              variant="outline-light"
              className="flex-shrink-1"
              onClick={() => {
                this.openSelectModal();
              }}
            >
              Select
            </Button>
          )}
          {selectedWriter.length === 0 && (
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
                  onClick={() => {
                    this.setState({});
                    this.openSelectModal();
                  }}
                >
                  Select
                </Button>
              </span>
            </OverlayTrigger>
          )}
        </InputGroup>
      </Fragment>
    );

    const lettersList = letters.map((l, k) => (
      <LetterDisplay
        user={user}
        letter={l}
        numRecipients={numRecipients[k]}
        letterKey={k}
        users={users}
      />
    ));

    return (
      <div>
        {!loadingLetters && (
          <div className="requestor">
            <div className="requestor-header">
              <h3 className="mb-3">New Request</h3>
            </div>

            <div className="requestor-select">
              <Card.Header className="requestor-select-writer">
                <div>{selectWriter}</div>
              </Card.Header>
              <Card.Header>
                <>
                  {selectIsOpen && selectedWriter !== null && (
                    <Select
                      user={this.props.user}
                      previouslySelectedRecipients={[]}
                      onClose={this.closeSelectModal.bind(this)}
                      onSubmit={this.onSelectSubmit.bind(this)}
                      users={this.state.users}
                    ></Select>
                  )}
                </>
              </Card.Header>
            </div>
            <div className="requestor-letters">
              <div>
                <h3> Requests </h3>
                {lettersList}
              </div>
            </div>
            <div className="requestor-footer">
              <span> Product of Team Gas</span>
            </div>
          </div>
        )}

        {loadingLetters && (
          <div className="d-flex justify-content-center absolute-center">
            <Spinner className="" animation="border" variant="secondary" />
          </div>
        )}
      </div>
    );
  }
}
export default Requestor;
