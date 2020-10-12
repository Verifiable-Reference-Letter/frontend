import React from "react";
import { Modal, Button } from "react-bootstrap";
import LetterDetails from "../../common/LetterDetails.interface";
import UserProfile from "../../common/UserProfile.interface";
import FileData from "../../common/FileData.interface";
import Profile from "../../components/Profile";
import Body from "../../common/Body.interface";
import "./FileView.css";
import UserAuth from "../../common/UserAuth.interface";

interface FileViewProps {
  user: UserAuth;
  letter: LetterDetails;
  fileData?: FileData;
  onClose: () => void;
}
interface FileViewState {
  // letterUrl: any;
  // letterType: string;
  profileIsOpen: boolean;
  selectedPublicAddress: string;
  userProfile?: UserProfile;
}

class FileView extends React.Component<FileViewProps, FileViewState> {
  constructor(props: FileViewProps) {
    super(props);
    this.state = {
      profileIsOpen: false,
      selectedPublicAddress: "",
    };
  }

  openProfileModal(selectedPublicAddress: string) {
    console.log("opening view modal");
    const fetchUrl = `/api/users/${selectedPublicAddress}/profile`;
    this.retrieveProfileFromServer(fetchUrl);
  }

  retrieveProfileFromServer(fetchUrl: string) {
    const init: RequestInit = {
      method: "PoST",
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
            this.setState({ userProfile: data[0], profileIsOpen: true });
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
  render() {
    const { fileData } = this.props;
    const { profileIsOpen } = this.state;
    return (
      <div>
        <div className="mb-3">
          {fileData && (
            <embed
              type={fileData.letterType}
              src={fileData.letterUrl}
              width="100%"
              height="360px"
            />
          )}
        </div>

        {/* <Table hover className="border border-secondary">
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
                    className="mt-3 float-right mb-3 mr-2"
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
                  className="mt-3 float-right mb-3"
                  onClick={(e: any) => {
                    this.openProfileModal(requestor.publicAddress);
                  }}
                >
                  *
                </Button>
              </td>
            </tr>
          </tbody>
        </Table> */}

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
