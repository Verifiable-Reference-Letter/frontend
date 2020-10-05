import React from "react";
import { Container, Row, Button, Modal } from "react-bootstrap";
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
      <Row key={k}>
        <div className="full-width">
          <span className="text-float-left">({l.letterId})&nbsp;</span>
          <span className="text-float-left">Sent to: {l.recipient.name}</span>
          <Button
            variant="primary"
            className="left-float-right-button"
            onClick={() => {
              this.openProfileModal(k);
            }}
          >
            *
          </Button>
        </div>
      </Row>
    ));

    return (
      <div>
        <Container fluid>{historyList}</Container>
        <Button
          className="form-button"
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
          size="lg"
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
