import React from "react";
import { Fragment } from "react";
import {
  Card,
  Button,
  Spinner,
  Modal,
  Collapse,
  Col,
  Row,
} from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import UserProfile from "../common/UserProfile.interface";
import UserAuth from "../common/UserAuth.interface";
import LetterHistory from "../common/LetterHistory.interface";
import RequestBody from "../common/RequestBody.interface";
import ResponseBody from "../common/ResponseBody.interface";
import User from "../common/User.interface";
import "./LetterDisplay.css";
import LetterDetails from "../common/LetterDetails.interface";

import FileView from "../components/FileView";
import FileHistory from "../components/FileHistory";
import Profile from "../components/Profile";
import Select from "../components/Select";

interface LetterDisplayProps {
  user: UserAuth;
  letter: LetterDetails;
  numRecipients: Number;
  letterKey: number;
  users: User[];
}
interface LetterDisplayState {
  history: LetterHistory[];
  loadingSelect: boolean;
  loadingHistory: boolean;
  selectIsOpen: boolean;
  profileIsOpen: boolean;
  historyIsOpen: boolean;
  uploadIsOpen: boolean;
  collapseIsOpen: boolean;
  previouslySelectedRecipients: User[];
  selectedRecipients: User[];
  selectedPublicAddress?: string;
  selectedUserProfile?: UserProfile;
}

class LetterDisplay extends React.Component<
  LetterDisplayProps,
  LetterDisplayState
> {
  private userProfiles: Map<string, UserProfile>;

  constructor(props: LetterDisplayProps) {
    super(props);
    this.state = {
      history: [],
      loadingHistory: false,
      loadingSelect: false,
      selectIsOpen: false,
      profileIsOpen: false,
      historyIsOpen: false,
      uploadIsOpen: false,
      collapseIsOpen: false,
      previouslySelectedRecipients: [],
      selectedRecipients: [],
    };

    this.userProfiles = new Map<string, UserProfile>();
  }

  async onSelectSubmit() {
    console.log("on select submit");

    // TODO: fetch backend to update recipients list (more complex sql)
    // this.state.selectedRecipients;
    this.setState({
      selectIsOpen: false,
      collapseIsOpen: false,
    });
  }

  async closeSelectModal() {
    console.log("closing select modal");
    this.setState({
      selectIsOpen: false,
      loadingSelect: false,
      collapseIsOpen: this.state.historyIsOpen,
    });
  }

  async openSelectModal() {
    console.log("on send click");
    // fetch backend to get recipients list (who the letter has not been sent to)
    const fetchUrl = `/api/v1/letters/${this.props.letter.letterId}/unsentRecipients`;

    if (this.state.previouslySelectedRecipients.length === 0) {
      this.setState({
        loadingSelect: true,
        collapseIsOpen: true,
        selectIsOpen: true,
      });
      this.retrieveRecipientsFromServer(fetchUrl);
    } else {
      this.setState({
        selectIsOpen: true,
        collapseIsOpen: true,
      });
    }
  }

  async retrieveRecipientsFromServer(fetchUrl: string) {
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

    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`,
        init
      );
      if (response.status === 400) {
        console.log(response.status);
        this.setState({
          loadingSelect: false,
          selectIsOpen: false,
          collapseIsOpen: this.state.historyIsOpen,
        });
      } else {
        let body = await response.json();

        const data: User[] = body.data;
        console.log(response);
        console.log(data);
        if (data && data.length !== 0) {
          this.setState({
            previouslySelectedRecipients: data,
            loadingSelect: false,
          });
        } else {
          this.setState({
            loadingSelect: false,
            selectIsOpen: false,
            collapseIsOpen: this.state.historyIsOpen,
          });
        }
      }
    } catch (e) {
      console.log(e);
      this.setState({
        loadingSelect: false,
        selectIsOpen: false,
        collapseIsOpen: this.state.historyIsOpen,
      });
    }

    // const previous = [
    //   {
    //     name: "Peanut Butter",
    //     publicAddress: "0xweojsdkfojo1291029i31092kofjdsd",
    //   },
    //   {
    //     name: "Jelly Legs",
    //     publicAddress: "0xp12h9hg0shdo230rh0wefhwdbgk1b20",
    //   },
    // ];
    // this.setState({
    //   previouslySelectedRecipients: previous,
    //   loadingSelect: false,
    // });
  }

  async closeProfileModal() {
    console.log("closing profile modal");
    this.setState({ profileIsOpen: false });
  }

  async openProfileModal(publicAddress: string) {
    console.log("opening profile modal");
    const userProfile = this.userProfiles.get(publicAddress);
    console.log(userProfile);
    if (userProfile === undefined) {
      const fetchUrl = `/api/v1/users/${publicAddress}/profile`;
      this.retrieveProfileFromServer(fetchUrl);
    } else {
      this.setState({ selectedUserProfile: userProfile, profileIsOpen: true });
    }
  }

  async retrieveProfileFromServer(fetchUrl: string) {
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
    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`,
        init
      );
      let body = await response.json();

      const data: UserProfile[] = body.data;
      console.log(response);
      console.log(data);
      if (data && data.length !== 0) {
        this.userProfiles.set(data[0].publicAddress, data[0]);
        this.setState({
          profileIsOpen: true,
          selectedUserProfile: data[0],
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async closeHistoryModal() {
    console.log("closing history modal");
    this.setState({
      historyIsOpen: false,
      loadingHistory: false,
      collapseIsOpen: this.state.selectIsOpen,
    });
  }

  async openHistoryModal() {
    console.log("opening history modal");

    if (this.state.history.length === 0) {
      this.setState({
        loadingHistory: true,
        historyIsOpen: true,
        collapseIsOpen: true,
      });
      const letterId = this.props.letter.letterId;
      const fetchUrl = `/api/v1/letters/${letterId}/history`;
      this.retrieveHistoryFromServer(fetchUrl);
    } else {
      this.setState({
        historyIsOpen: true,
        collapseIsOpen: true,
      });
    }
  }

  async retrieveHistoryFromServer(fetchUrl: string) {
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
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`,
        init
      );
      if (response.status === 400) {
        console.log(response.status);
        this.setState({
          // historyIsOpen: false,
          loadingHistory: false,
          // collapseIsOpen: this.state.selectIsOpen,
        });
      } else {
        const body = await response.json();

        const data: LetterHistory[] = body.data;
        console.log(response);
        console.log(data);
        if (data) {
          this.setState({
            history: data,
            loadingHistory: false,
          });
        } else {
          console.log("fetch for letterHistory failed");
          this.setState({
            // historyIsOpen: false,
            loadingHistory: false,
            // collapseIsOpen: this.state.selectIsOpen,
          });
        }
      }
    } catch (e) {
      console.log(e);
      this.setState({
        // historyIsOpen: false,
        loadingHistory: false,
        // collapseIsOpen: this.state.selectIsOpen,
      });
    }
  }

  render() {
    const { user, letter, numRecipients, letterKey, users } = this.props;
    const {
      history,
      loadingSelect,
      loadingHistory,
      selectIsOpen,
      profileIsOpen,
      historyIsOpen,
      uploadIsOpen,
      collapseIsOpen,
      previouslySelectedRecipients,
      selectedRecipients,
      selectedPublicAddress,
    } = this.state;

    return (
      <div>
        <Card className="full-width opacity-0">
          <Card.Header className="d-flex justify-content-between button-blur letter-entry">
            <div className="flex-fill">
              <span className="mr-3">From:</span>
              <Button
                variant="outline-light"
                onClick={(e: any) => {
                  // e.stopPropagation();
                  this.openProfileModal(letter.letterWriter.publicAddress);
                }}
              >
                {letter.letterWriter?.name}
              </Button>
            </div>
            <Button
              // TODO: add Tooltip
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                if (selectIsOpen) {
                  this.closeSelectModal();
                } else {
                  this.openSelectModal();
                }
              }}
            >
              Send
              {/* {letter.uploadedAt ? "Send" : "Edit"} */}
            </Button>
            <Button
              disabled={numRecipients === 0}
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                if (historyIsOpen) {
                  this.closeHistoryModal();
                } else {
                  this.openHistoryModal();
                }
              }}
            >
              History
            </Button>
            <Button
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={() => {
                this.setState({ collapseIsOpen: !collapseIsOpen });
              }}
              aria-controls="example-collapse-text"
              aria-expanded={collapseIsOpen}
            >
              *
            </Button>
          </Card.Header>
        </Card>
        <Collapse in={collapseIsOpen}>
          <div className="collapse-body-select">
            {loadingSelect && (
              <div className="d-flex justify-content-center">
                <Spinner
                  className="mb-3"
                  animation="border"
                  variant="secondary"
                />
              </div>
            )}
            {!loadingSelect && selectIsOpen && (
              <div>
                <Select
                  user={this.props.user}
                  previouslySelectedRecipients={
                    this.state.previouslySelectedRecipients
                  }
                  header="Select Recipients"
                  onClose={this.closeSelectModal.bind(this)}
                  onSubmit={this.onSelectSubmit.bind(this)}
                  users={this.props.users}
                ></Select>
              </div>
            )}
            {loadingHistory && (
              <div className="d-flex justify-content-center">
                <Spinner
                  className="mb-3"
                  animation="border"
                  variant="secondary"
                />
              </div>
            )}
            {!loadingHistory && historyIsOpen && (
              <div className="">
                <FileHistory
                  user={user}
                  history={history}
                  onClose={this.closeHistoryModal.bind(this)}
                ></FileHistory>
              </div>
            )}
            {(loadingHistory || historyIsOpen) && <div className="mb-5"></div>}
            {!selectIsOpen && !historyIsOpen && (
              <div className="display-text d-flex text-white-50">
                <div className="flex-fill">
                  Requested: {letter.requestedAt?.toString()}
                </div>
                {letter.uploadedAt && (
                  <div className=" flex-shrink-1 float-right">
                    Uploaded: {letter.uploadedAt?.toString()}
                  </div>
                )}
                {!letter.uploadedAt && (
                  <div className=" flex-shrink-1 float-right">Not Uploaded</div>
                )}
              </div>
            )}
          </div>
        </Collapse>

        <Modal
          id="profile-modal"
          show={profileIsOpen}
          onHide={this.closeProfileModal.bind(this)}
          // backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          // size="sm"
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
      </div>
    );
  }
}

export default LetterDisplay;
