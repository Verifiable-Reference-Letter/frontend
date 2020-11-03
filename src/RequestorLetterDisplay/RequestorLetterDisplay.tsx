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
import "./RequestorLetterDisplay.css";
import LetterDetails from "../common/LetterDetails.interface";

import Confirm from "../components/Confirm";
import FileView from "../components/FileView";
import FileHistory from "../components/FileHistory";
import Profile from "../components/Profile";
import Select from "../components/Select";

interface RequestorLetterDisplayProps {
  user: UserAuth;
  letter: LetterDetails;
  numRecipients: Number;
  users: User[];
}
interface RequestorLetterDisplayState {
  history: LetterHistory[];
  loadingSelect: boolean;
  loadingHistory: boolean;
  selectIsOpen: boolean;
  profileIsOpen: boolean;
  historyIsOpen: boolean;
  uploadIsOpen: boolean;
  confirmIsOpen: boolean;
  collapseIsOpen: boolean;
  previouslySelectedRecipients: User[];
  sentRecipients: User[];
  selectedRecipients: User[];
  selectedPublicAddress?: string;
  selectedUserProfile?: UserProfile;
}

class RequestorLetterDisplay extends React.Component<
  RequestorLetterDisplayProps,
  RequestorLetterDisplayState
> {
  private userProfiles: Map<string, UserProfile>;

  constructor(props: RequestorLetterDisplayProps) {
    super(props);
    this.state = {
      history: [],
      loadingHistory: false,
      loadingSelect: false,
      selectIsOpen: false,
      profileIsOpen: false,
      historyIsOpen: false,
      uploadIsOpen: false,
      confirmIsOpen: false,
      collapseIsOpen: false,
      previouslySelectedRecipients: [],
      sentRecipients: [],
      selectedRecipients: [],
    };

    this.userProfiles = new Map<string, UserProfile>();
  }

  async onSelectSubmit(customMessage: string) {
    console.log("on select submit");
    // this.setState({ confirmIsOpen: false });
    const fetchUrl = `/api/v1/letters/${this.props.letter.letterId}/updateRecipients`;
    this.sendUpdatedLetterRecipientsToServer(fetchUrl);
  }

  async sendUpdatedLetterRecipientsToServer(fetchUrl: string) {
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
        data: this.state.selectedRecipients,
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

        const data: User[] = body.data;
        console.log(response);
        console.log(data);
        if (data && data.length !== 0) {
          this.setState({
            selectIsOpen: false,
            confirmIsOpen: false,
            collapseIsOpen: this.state.historyIsOpen,
            previouslySelectedRecipients: data,
          });
        } else {
        }
      }
    } catch (e) {
      console.log(e);
    }
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
    const unsentUrl = `/api/v1/letters/${this.props.letter.letterId}/unsentRecipients`;
    const sentUrl = `/api/v1/letters/${this.props.letter.letterId}/sentRecipients`;

    if (this.state.previouslySelectedRecipients.length === 0) {
      this.setState({
        loadingSelect: true,
        collapseIsOpen: true,
        selectIsOpen: true,
      });
      await this.retrieveUnsentRecipientsFromServer(unsentUrl);
      await this.retrieveSentRecipientsFromServer(sentUrl)
    } else {
      this.setState({
        selectIsOpen: true,
        collapseIsOpen: true,
      });
    }
  }

  async retrieveUnsentRecipientsFromServer(fetchUrl: string) {
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
          // selectIsOpen: false,
          // collapseIsOpen: this.state.historyIsOpen,
        });
      } else {
        let body = await response.json();

        const data: User[] = body.data;
        console.log(response);
        console.log(data);
        this.setState({
          previouslySelectedRecipients: data,
          // loadingSelect: false,
        });
      }
    } catch (e) {
      console.log(e);
      this.setState({
        loadingSelect: false,
        // selectIsOpen: false,
        // collapseIsOpen: this.state.historyIsOpen,
      });
    }
  }

  async retrieveSentRecipientsFromServer(fetchUrl: string) {
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
          // selectIsOpen: false,
          // collapseIsOpen: this.state.historyIsOpen,
        });
      } else {
        let body = await response.json();

        const data: User[] = body.data;
        console.log(response);
        console.log(data);
        this.setState({
          sentRecipients: data,
          loadingSelect: false,
        });
      }
    } catch (e) {
      console.log(e);
      this.setState({
        loadingSelect: false,
        // selectIsOpen: false,
        // collapseIsOpen: this.state.historyIsOpen,
      });
    }
  }

  async openMessageModal(selectedRecipients: User[]) {
    this.setState({ selectedRecipients: selectedRecipients });
    this.openConfirmModal();
  }

  async closeMessageModal() {}

  async closeProfileModal() {
    console.log("closing profile modal");
    this.setState({ profileIsOpen: false, selectedUserProfile: undefined });
  }

  async openProfileModal(publicAddress: string) {
    console.log("opening profile modal");
    const userProfile = this.userProfiles.get(publicAddress);
    console.log(userProfile);
    if (userProfile === undefined) {
      this.setState({ profileIsOpen: true });
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

    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`,
        init
      );

      if (response.status === 400) {
        console.log(response.status);
        // this.setState({
        //   profileIsOpen: false,
        // });
      } else {
        let body = await response.json();
        const data: UserProfile[] = body.data;
        console.log(response);
        console.log(data);
        if (data && data.length !== 0) {
          this.userProfiles.set(data[0].publicAddress, data[0]);
          this.setState({
            selectedUserProfile: data[0],
          });
        } else {
          // this.setState({
          //   profileIsOpen: false,
          // });
        }
      }
    } catch (e) {
      console.log(e);
      // this.setState({
      //   profileIsOpen: false,
      // });
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

  async openConfirmModal() {
    console.log("open confirm modal");
    this.setState({ confirmIsOpen: true });
  }

  async closeConfirmModal() {
    console.log("close confirm modal");
    this.setState({ confirmIsOpen: false });
  }

  render() {
    const { user, letter, numRecipients, users } = this.props;
    const {
      history,
      loadingSelect,
      loadingHistory,
      selectIsOpen,
      profileIsOpen,
      historyIsOpen,
      uploadIsOpen,
      confirmIsOpen,
      collapseIsOpen,
      previouslySelectedRecipients,
      sentRecipients,
      selectedRecipients,
      selectedPublicAddress,
    } = this.state;

    return (
      <div>
        <Card className="full-width opacity-0">
          <Card.Header
            className="d-flex justify-content-between button-blur letter-entry"
            onClick={() => this.setState({ collapseIsOpen: !collapseIsOpen })}
          >
            <div className="flex-fill">
              <span className="mr-3">From:</span>
              <Button
                variant="outline-light"
                onClick={(e: any) => {
                  e.stopPropagation();
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
                e.stopPropagation();
                if (selectIsOpen) {
                  this.closeSelectModal();
                } else {
                  this.openSelectModal();
                }
              }}
            >
              Edit
            </Button>
            <Button
              disabled={numRecipients === 0}
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
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
              onClick={(e: any) => {
                e.stopPropagation();
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
                  user={user}
                  previouslySelectedRecipients={
                    this.state.previouslySelectedRecipients
                  }
                  header="Edit Recipients"
                  onClose={this.closeSelectModal.bind(this)}
                  onSubmit={this.openMessageModal.bind(this)}
                  users={users.filter(
                    (user: User) => {
                      let b = user.publicAddress !== letter.letterWriter.publicAddress;
                      if (b) {
                        for (let i = 0; i < sentRecipients.length; i++) {
                          b = user.publicAddress !== sentRecipients[i]?.publicAddress
                        }
                      }
                      return b;
                    }
                  )}
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
            <Profile
              user={this.state.selectedUserProfile}
              onClose={this.closeProfileModal.bind(this)}
            />
          </Modal.Body>
        </Modal>

        <Modal
          id="confirm-modal"
          show={confirmIsOpen}
          onHide={this.closeConfirmModal.bind(this)}
          // backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          // size="sm"
        >
          <Modal.Header closeButton>
            <Modal.Title>Please Confirm</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Confirm
              user={this.props.user}
              custom={false}
              onConfirm={this.onSelectSubmit.bind(this)}
              onClose={this.closeConfirmModal.bind(this)}
            />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default RequestorLetterDisplay;
