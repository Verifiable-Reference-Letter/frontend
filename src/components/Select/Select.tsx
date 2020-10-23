import React from "react";
import { Fragment } from "react";
import {
  Card,
  Button,
  InputGroup,
  OverlayTrigger,
  Tooltip,
  Modal,
  Col,
  Row,
} from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
// import LetterDetails from "../../common/LetterDetails.interface";
// import FileData from "../../common/FileData.interface";
import UserProfile from "../../common/UserProfile.interface";
import Profile from "../Profile";
import RequestBody from "../../common/RequestBody.interface";
import ResponseBody from "../../common/ResponseBody.interface";
import User from "../../common/User.interface";
import "./Select.css";
import UserAuth from "../../common/UserAuth.interface";

interface SelectProps {
  user: UserAuth;
  users: User[];
  previouslySelectedRecipients: User[];
  header: string;
  onSubmit: (selectedRecipients: User[]) => void;
  onClose: () => void;
}
interface SelectState {
  selectedRecipients: User[];
  profileIsOpen: boolean;
  selectedUserProfile?: UserProfile;
}

class Select extends React.Component<SelectProps, SelectState> {
  private userProfiles: Map<string, UserProfile>;
  constructor(props: SelectProps) {
    super(props);
    this.state = {
      selectedRecipients: this.props.previouslySelectedRecipients,
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

  onSelectSubmit() {
    console.log("select submit");
    this.props.onSubmit(this.state.selectedRecipients);
  }

  render() {
    const { users, header } = this.props;
    const { profileIsOpen, selectedRecipients } = this.state;

    const selectRecipients = (
      <Fragment>
        <InputGroup className="border-radius mb-0">
          <div className="multiple-typeahead recipient-typeahead">
            <Typeahead
              id="select-recipients-typeahead"
              // minLength={2}
              multiple
              labelKey="name"
              filterBy={["name", "publicAddress"]}
              options={users}
              // placeholder="Select Recipients" // can't change color to white
              paginate={true}
              selected={selectedRecipients}
              onChange={(selected) => {
                console.log(selected);
                this.setState({
                  selectedRecipients: selected,
                });
              }}
              renderMenuItemChildren={
                (option) =>
                  `${option.name} (${option.publicAddress.slice(0, 6)} . . . )` // TODO: add padding with service
              }
            />
          </div>
        </InputGroup>
      </Fragment>
    );

    let recipientsList = [];
    for (let i = 0; i < selectedRecipients.length; i += 3) {
      recipientsList.push(
        <Row>
          <Col>
            <div className="d-flex justify-content-between recipient-entry">
              <div
                className="flex-fill body-text"
                onClick={() =>
                  this.openProfileModal(selectedRecipients[i].publicAddress)
                }
              >
                {selectedRecipients[i].name}
              </div>
            </div>
          </Col>
          {i + 1 < selectedRecipients.length && (
            <Col>
              <div className="d-flex justify-content-between recipient-entry">
                <div
                  className="flex-fill body-text"
                  onClick={() =>
                    this.openProfileModal(
                      selectedRecipients[i + 1].publicAddress
                    )
                  }
                >
                  {selectedRecipients[i + 1].name}
                </div>
              </div>
            </Col>
          )}

          {i + 1 >= selectedRecipients.length && (
            <Col>
              <Card.Header className="d-flex justify-content-between recipient-placeholder"></Card.Header>
            </Col>
          )}

          {i + 2 < selectedRecipients.length && (
            <Col>
              <div className="d-flex justify-content-between recipient-entry">
                <div
                  className="flex-fill body-text"
                  onClick={() =>
                    this.openProfileModal(
                      selectedRecipients[i + 2].publicAddress
                    )
                  }
                >
                  {selectedRecipients[i + 2].name}
                </div>
              </div>
            </Col>
          )}

          {i + 2 >= selectedRecipients.length && (
            <Col>
              <Card.Header className="d-flex justify-content-between recipient-placeholder"></Card.Header>
            </Col>
          )}
        </Row>
      );
    }

    return (
      <div>
        <Row>
          <h5>{header}</h5>
        </Row>
        <div className="mb-3">{selectRecipients}</div>
        {selectedRecipients.length !== 0 && (
          <Col className="recipient-display mb-3">{recipientsList}</Col>
        )}

        <div className="d-flex border-radius button-blur mb-2">
          <div className="flex-fill"></div>
          {selectedRecipients.length !== 0 && (
            <Button
              variant="outline-light"
              className="flex-shrink-1 float-right"
              onClick={() => {
                this.props.onSubmit(selectedRecipients);
              }}
            >
              Submit
            </Button>
          )}
          {selectedRecipients.length === 0 && (
            <OverlayTrigger
              overlay={
                <Tooltip id="tooltip-disabled" placement="right">
                  No Recipients Selected
                </Tooltip>
              }
            >
              <span className="d-inline-block">
                <Button
                  variant="outline-light"
                  className="flex-shrink-1 float-right"
                  disabled
                  style={{ pointerEvents: "none" }}
                  onClick={() => {
                    this.props.onSubmit(selectedRecipients);
                  }}
                >
                  Submit
                </Button>
              </span>
            </OverlayTrigger>
          )}
          <Button
            variant="outline-light"
            className="flex-shrink-1 ml-3"
            onClick={() => {
              this.setState({
                selectedRecipients: this.props.previouslySelectedRecipients,
              });
            }}
          >
            Reset
          </Button>
          
          <Button
            variant="outline-light"
            className="flex-shrink-1 float-right ml-3"
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

export default Select;
