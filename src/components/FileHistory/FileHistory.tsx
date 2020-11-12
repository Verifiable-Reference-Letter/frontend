import React from "react";
import {
  Card,
  Collapse,
  Col,
  Row,
  Button,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import "./FileHistory.css";
import LetterHistory from "../../common/LetterHistory.interface";
import UserProfile from "../../common/UserProfile.interface";
import Profile from "../../components/Profile";
import RequestBody from "../../common/RequestBody.interface";
import ResponseBody from "../../common/ResponseBody.interface";
import User from "../../common/User.interface";
import UserAuth from "../../common/UserAuth.interface";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

interface FileHistoryProps {
  user: UserAuth;
  history: LetterHistory[];
  onClose: () => void;
}
interface FileHistoryState {
  collapseIsOpen: boolean[];
  profileIsOpen: boolean;
  selectedUserProfile?: UserProfile;
}

class FileHistory extends React.Component<FileHistoryProps, FileHistoryState> {
  private userProfiles: Map<string, UserProfile>;

  constructor(props: FileHistoryProps) {
    super(props);

    let collapseIsOpen = [];
    for (let i = 0; i < this.props.history.length; i++) {
      collapseIsOpen.push(false);
    }

    this.state = {
      collapseIsOpen: collapseIsOpen,
      profileIsOpen: false,
    };

    this.userProfiles = new Map<string, UserProfile>();
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

  render() {
    const { history } = this.props;
    const { profileIsOpen, collapseIsOpen } = this.state;

    let historyList = [];
    for (let i = 0; i < history.length; i += 2) {
      historyList.push(
        <Row>
          <Col>
            <Card className="full-width opacity-0 mt-3">
              <div className="d-flex justify-content-between">
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="history-entries">
                      {!collapseIsOpen[i] ? "See history details" : "Close details"}
                    </Tooltip>
                  }
                >
                  <Card.Header
                    className="flex-fill history-entry"
                    onClick={() => {
                      let c = [...collapseIsOpen];
                      c[i] = !c[i];
                      this.setState({ collapseIsOpen: c });
                    }}
                  >
                    {history[i].letterRecipient.name}
                  </Card.Header>
                </OverlayTrigger>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="main-buttons">
                      <div>
                        View {history[i].letterRecipient.name}'s profile
                      </div>
                    </Tooltip>
                  }
                >
                  <Card.Header
                    className="flex-shrink-1 history-collapse-button"
                    onClick={() => {
                      this.openProfileModal(
                        history[i].letterRecipient.publicAddress
                      );
                    }}
                  />
                </OverlayTrigger>
              </div>
            </Card>
            <Collapse in={collapseIsOpen[i]}>
              <div className="body-text text-white-50">
                Sent At: {history[i].sentAt}
              </div>
            </Collapse>
          </Col>
          {i + 1 < history.length && (
            <Col>
              <Card className="full-width opacity-0 mt-3">
                <div className="d-flex justify-content-between">
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="main-buttons">
                        {!collapseIsOpen[i + 1] ? "See history details" : "Close details"}
                      </Tooltip>
                    }
                  >
                    <Card.Header
                      className="flex-fill history-entry"
                      onClick={() => {
                        let c = [...collapseIsOpen];
                        c[i + 1] = !c[i + 1];
                        this.setState({ collapseIsOpen: c });
                      }}
                    >
                      {history[i + 1].letterRecipient.name}
                    </Card.Header>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="main-buttons">
                        <div>
                          View {history[i + 1].letterRecipient.name}'s profile
                        </div>
                      </Tooltip>
                    }
                  >
                    <Card.Header
                      className="flex-shrink-1 history-collapse-button"
                      onClick={() => {
                        this.openProfileModal(
                          history[i + 1].letterRecipient.publicAddress
                        );
                      }}
                    />
                  </OverlayTrigger>
                </div>
              </Card>
              <Collapse in={collapseIsOpen[i + 1]}>
                <div className="body-text text-white-50">
                  Sent At: {history[i + 1].sentAt}
                </div>
              </Collapse>
            </Col>
          )}

          {i + 1 >= history.length && (
            <Col>
              <Card className="full-width opacity-0 mt-3"></Card>
              <Card.Header className="d-flex justify-content-between history-placeholder"></Card.Header>
            </Col>
          )}
        </Row>
      );
    }

    return (
      <div className="button-blur">
        {history.length === 0 && (
          <Col>
            <Row>
              <h5 className="w-100 text-center">No History</h5>
            </Row>
          </Col>
        )}
        {history.length !== 0 && (
          <>
            <Col>
              <Row>
                <h5>History</h5>
              </Row>
              <Row>
                <Col className="history-display">{historyList}</Col>
              </Row>
              <Row className="d-flex mb-2">
                <div className="mt-5 flex-shrink-1">
                  <OverlayTrigger
                    placement="right"
                    overlay={
                      <Tooltip id="learn-more">
                        <div>
                          Your letter <b>History</b> indicates <em>who</em> your
                          letter has been sent to. You may view the profile of
                          each recipient. See more in the FAQs.
                        </div>
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faInfoCircle} size="lg" />
                  </OverlayTrigger>
                </div>
                <div className="flex-fill"></div>
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip">
                      Close letter history
                    </Tooltip>
                  }
                >
                  <Button
                    className="mt-3 float-right flex-shrink-1"
                    variant="outline-light"
                    onClick={(e: any) => {
                      this.props.onClose();
                    }}
                  >
                    Close
                  </Button>
                </OverlayTrigger>
              </Row>
            </Col>

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
                <Modal.Title>
                  {this.state.selectedUserProfile?.name}
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
          </>
        )}
      </div>
    );
  }
}

export default FileHistory;
