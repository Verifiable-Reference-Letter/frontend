import React, { useRef } from "react";
import { Fragment } from "react";
import {
  Card,
  Button,
  InputGroup,
  OverlayTrigger,
  Tooltip,
  Modal,
} from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";

import LetterDetails from "../../common/LetterDetails.interface";
import UserProfile from "../../common/UserProfile.interface";
import FileData from "../../common/FileData.interface";
import Profile from "../../components/Profile";
import Body from "../../common/Body.interface";
import User from "../../common/User.interface";
import "./Request.css";
import UserAuth from "../../common/UserAuth.interface";

interface RequestProps {
  user: UserAuth;
  users: User[];
  onSubmit: (requestedRecipients: User[]) => void;
  onClose: () => void;
}
interface RequestState {
  requestedRecipients: User[];
  profileIsOpen: boolean;
  selectedPublicAddress: string;
  selectedUserProfile?: UserProfile;
}

class Request extends React.Component<RequestProps, RequestState> {
  constructor(props: RequestProps) {
    super(props);
    this.state = {
      requestedRecipients: [],
      profileIsOpen: false,
      selectedPublicAddress: "",
    };
  }

  openProfileModal(selectedPublicAddress: string) {
    console.log("opening view modal");
    const fetchUrl = `/api/users/${selectedPublicAddress}`;
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
            this.setState({
              selectedUserProfile: data[0],
              profileIsOpen: true,
            });
          })
          .catch((e: Error) => {
            console.log(e);
          });
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  closeProfileModal() {
    console.log("closing view modal");
    this.setState({ profileIsOpen: false });
  }

  onSelectSubmit() {
    console.log("select submit");
    this.props.onSubmit(this.state.requestedRecipients);
  }

  render() {
    const { users } = this.props;
    const {
      profileIsOpen,
      selectedPublicAddress,
      requestedRecipients,
    } = this.state;

    let recipientList;
    if (requestedRecipients.length % 2 === 0) {
      recipientList = requestedRecipients.map((r, k) => (
        <Card.Header className="d-flex justify-content-between recipient-entry">
          <div className="flex-fill recipient-list-body">{r.name}</div>
          <Button
            variant="primary"
            className="flex-shrink-1 float-right"
            onClick={() => this.openProfileModal(r.publicAddress)}
          >
            View
          </Button>
        </Card.Header>
      ));
    } else {
      recipientList = requestedRecipients.map((r, k) => (
        <Card.Header className="d-flex justify-content-between recipient-entry">
          <div className="flex-fill recipient-list-body">{r.name}</div>
          <Button
            variant="primary"
            className="flex-shrink-1 float-right"
            onClick={() => this.openProfileModal(r.publicAddress)}
          >
            View
          </Button>
        </Card.Header>
      ));
    }

    return (
      <div>
        <Fragment>
          <InputGroup className="border-radius mb-0">
            <div className="multiple-typeahead recipient-typeahead">
              <Typeahead
                id="select-recipients"
                // minLength={2}
                multiple
                labelKey="name"
                filterBy={["name", "publicAddress"]}
                options={users}
                placeholder="Select Recipients"
                paginate={true}
                selected={this.state.requestedRecipients}
                onChange={(selected) => {
                  console.log(selected);
                  this.setState({
                    requestedRecipients: selected,
                  });
                }}
                renderMenuItemChildren={
                  (option) => `${option.name} (${option.publicAddress})` // TODO: add padding with service
                }
              />
            </div>
          </InputGroup>
        </Fragment>
        {requestedRecipients.length !== 0 &&
          requestedRecipients.length % 2 === 1 && (
            <div className="mt-4 recipient-display">
              {recipientList}
              <div className="d-flex justify-content-between recipient-placeholder"></div>
            </div>
          )}

        {requestedRecipients.length !== 0 &&
          requestedRecipients.length % 2 === 0 && (
            <div className="mt-4 recipient-display">{recipientList}</div>
          )}

        <div className="d-flex mt-4 border-radius">
          {requestedRecipients.length !== 0 && (
            <Button
              variant="primary"
              className="flex-shrink-1"
              onClick={() => this.onSelectSubmit()}
            >
              Select
            </Button>
          )}
          {requestedRecipients.length === 0 && (
            <OverlayTrigger
              overlay={
                <Tooltip id="tooltip-disabled" placement="right">
                  No Recipients Selected
                </Tooltip>
              }
            >
              <span className="d-inline-block">
                <Button
                  variant="primary"
                  className="flex-shrink-1"
                  disabled
                  style={{ pointerEvents: "none" }}
                  onClick={() => this.onSelectSubmit()}
                >
                  Select
                </Button>
              </span>
            </OverlayTrigger>
          )}
          <Button
            variant="primary"
            className="flex-shrink-1 ml-2"
            onClick={() => {
              this.setState({ requestedRecipients: [] });
            }}
          >
            Clear
          </Button>
          <div className="flex-fill"></div>
          <Button
            variant="primary"
            className="flex-shrink-1 float-right ml-2 close-button"
            onClick={() => {
              this.props.onClose();
            }}
          >
            Close
          </Button>
        </div>
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
      </div>
    );
  }
}

export default Request;
