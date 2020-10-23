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
import UserProfile from "../common/UserProfile.interface";
import UserAuth from "../common/UserAuth.interface";
import RequestBody from "../common/RequestBody.interface";
import ResponseBody from "../common/ResponseBody.interface";
import "./RecipientUserDisplay.css";

import FileView from "../components/FileView/FileView";
import Profile from "../components/Profile";
import User from "../common/User.interface";

interface RecipientUserDisplayProps {
  user: UserAuth;
  requestor: User;
  onView: (publicAddress: string) => void;
}
interface RecipientUserDisplayState {
  profileIsOpen: boolean;
  viewIsOpen: boolean;
  collapseIsOpen: boolean;
  selectedUserProfile?: UserProfile;
}

class RecipientUserDisplay extends React.Component<
  RecipientUserDisplayProps,
  RecipientUserDisplayState
> {
  private viewModal = React.createRef<FileView>();
  private userProfiles: Map<string, UserProfile>;

  constructor(props: RecipientUserDisplayProps) {
    super(props);
    this.state = {
      profileIsOpen: false,
      viewIsOpen: false,
      collapseIsOpen: false,
    };

    this.userProfiles = new Map<string, UserProfile>();
  }

  async openMessageModal() {}

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

  render() {
    const { user, requestor } = this.props;
    const { profileIsOpen, viewIsOpen, collapseIsOpen } = this.state;

    return (
      <div>
        <Card className="full-width opacity-0">
          <Card.Header
            className="d-flex justify-content-between button-blur letter-entry"
            onClick={() => this.setState({ collapseIsOpen: !collapseIsOpen })}
          >
            <div className="flex-fill">
              <span className="mr-3">For: </span>
              <Button
                variant="outline-light"
                onClick={(e: any) => {
                  e.stopPropagation();
                  this.openProfileModal(requestor?.publicAddress);
                }}
              >
                {requestor?.name}
              </Button>
            </div>
            <Button
              // TODO: add Tooltip
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
                this.props.onView(requestor.publicAddress);
              }}
            >
              Letters
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
            <div className="display-text d-flex text-white-50">
              <div className="flex-fill">Application Information</div>
            </div>
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
      </div>
    );
  }
}

export default RecipientUserDisplay;
