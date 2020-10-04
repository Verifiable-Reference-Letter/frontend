import React from "react";
import { Modal, Button, ListGroup, Table } from "react-bootstrap";
import LetterDetails from "../../common/LetterDetails.interface";
import UserProfile from "../../common/UserProfile.interface";
import Profile from "../../components/Profile";
import Body from "../../common/Body.interface";
import "./FileView.css";

interface FileViewProps {
  letter: LetterDetails;
  file?: File;
  onClose: () => void;
}
interface FileViewState {
  letterUrl: any;
  letterType: string;
  profileIsOpen: boolean;
  selectedPublicAddress: string;
  userProfile?: UserProfile;
}

class FileView extends React.Component<FileViewProps, FileViewState> {
  componentWillMount() {
    const file = this.props.file;
    let reader = new FileReader();
    if (file !== undefined) {
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        this.setState({ letterUrl: reader.result, letterType: file.type });
      };
      console.log("letterUrl", this.state.letterUrl);
    }
  }

  constructor(props: FileViewProps) {
    super(props);
    this.state = {
      letterUrl: null,
      letterType: "",
      profileIsOpen: false,
      selectedPublicAddress: "",
    };
  }

  openProfileModal(selectedPublicAddress: string) {
    console.log("opening view modal");
    const fetchUrl = `/api/users/${selectedPublicAddress}`;
    this.retrieveFromServer(fetchUrl);
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
            this.setState({ userProfile: data[0], profileIsOpen: true });
          })
          .catch((e: Error) => {
            console.log(e);

            // REMOVE TESTING
            this.setState({
              userProfile: {
                publicAddress: "0xTEMPORARYPUBLICADDRESSROUTENOTWRITTEN",
                name: "TEMPORARYNAMEYESTHATISMYNAME",
              },
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
    const { letter, file } = this.props;
    const requestor = letter.requestor;
    const writer = letter.writer;
    const {
      letterUrl,
      letterType,
      profileIsOpen,
      selectedPublicAddress,
    } = this.state;
    return (
      <div>
        <div className="mb-3">
          {file && (
            <embed
              type={letterType}
              src={letterUrl}
              width="100%"
              height="360px"
            />
          )}
        </div>

        <Table hover className="border border-secondary">
          <thead>
            <tr>
              <th className="border border-secondary .bg-secondary">
                Letter ID
              </th>
              <th className="border border-secondary">Requestor</th>
              <th className="border border-secondary">Writer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-secondary">{letter.letterId}</td>
              <td className="border border-secondary">
                <div>
                  {requestor.name} ({requestor.publicAddress})
                  <Button
                    className="form-button float-right mb-3 mr-2"
                    onClick={(e: any) => {
                      this.openProfileModal(requestor.publicAddress);
                    }}
                  >
                    *
                  </Button>
                </div>
              </td>
              <td className="border border-secondary">
                {writer.name} ({writer.publicAddress})
                <Button
                  className="form-button float-right mb-3"
                  onClick={(e: any) => {
                    this.openProfileModal(requestor.publicAddress);
                  }}
                >
                  *
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>

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
            <Modal.Title>User Profile</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {this.state.userProfile && (
              <Profile
                user={this.state.userProfile}
                onClose={this.closeProfileModal.bind(this)}
              />
            )}
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default FileView;
