import React from "react";
import { Card, Button, Modal } from "react-bootstrap";
import "./FileHistory.css";
import LetterHistory from "../../common/LetterHistory.interface";
import UserProfile from "../../common/UserProfile.interface";
import Profile from "../../components/Profile";
import Body from "../../common/Body.interface";

interface FileHistoryProps {
  history: LetterHistory[];
  onClose: () => void;
}
interface FileHistoryState {
  profileIsOpen: boolean;
  selectedUserKey: number;
  selectedUserName: string;
  selectedUserProfile?: UserProfile;
}

class FileHistory extends React.Component<FileHistoryProps, FileHistoryState> {
  componentWillMount() {}

  constructor(props: FileHistoryProps) {
    super(props);
    this.state = {
      profileIsOpen: false,
      selectedUserKey: -1,
      selectedUserName: "",
    };
  }

  openProfileModal(key: number) {
    console.log("opening view modal");
    const recipient: UserProfile = this.getRecipientByKey(key);
    this.setState({ selectedUserKey: key, selectedUserName: recipient.name });
    const fetchUrl = `/api/users/${recipient.publicAddress}`;
    this.retrieveFromServer(fetchUrl);
  }

  getRecipientByKey(key: number) {
    return this.props.history[key].recipient;
  }

  retrieveFromServer(fetchUrl: string) {
    const init: RequestInit = {
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
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

            // REMOVE TESTING
            this.setState({
              selectedUserProfile: this.getRecipientByKey(
                this.state.selectedUserKey
              ),
              profileIsOpen: true,
            });
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

  render() {
    const { history } = this.props;
    const { profileIsOpen } = this.state;
    const historyList = history.map((l, k) => (
      <Card.Header className="d-flex justify-content-between recipient-entry" key={k}>
          <div className="flex-fill recipient-body">Sent to: {l.recipient.name}</div>
          <Button
            variant="primary"
            className="flex-shrink-1 float-right"
            onClick={() => {
              this.openProfileModal(k);
            }}
          >
            View
          </Button>
      </Card.Header>
    ));

    return (
      <div>
        <div>{historyList}</div>
        <Button
          className="mt-3"
          onClick={(e: any) => {
            this.props.onClose();
          }}
        >
          Close
        </Button>

        <Modal
          id="profile-modal"
          show={profileIsOpen}
          onHide={this.closeProfileModal.bind(this)}
          backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          size="sm"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              User Profile: ({this.state.selectedUserName})
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
      </div>
    );
  }
}

export default FileHistory;
