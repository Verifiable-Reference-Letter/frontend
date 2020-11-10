import React from "react";
import {
  Modal,
  Button,
  Spinner,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import LetterDetails from "../../common/LetterDetails.interface";
import UserProfile from "../../common/UserProfile.interface";
import FileData from "../../common/FileData.interface";
import Profile from "../../components/Profile";
import RequestBody from "../../common/RequestBody.interface";
import ResponseBody from "../../common/ResponseBody.interface";
import "./FileView.css";
import UserAuth from "../../common/UserAuth.interface";

interface FileViewProps {
  user: UserAuth;
  fileData?: FileData;
  loadingView: boolean;
  onClose: () => void;
}
interface FileViewState {
  profileIsOpen: boolean;
  selectedPublicAddress: string;
  selectedUserProfile?: UserProfile;
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
    const fetchUrl = `/api/v1/users/${selectedPublicAddress}/profile`;
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
          .then((body: ResponseBody) => {
            const data: UserProfile[] = body.data;
            console.log(response);
            if (data && data.length !== 0) {
              this.setState({
                selectedUserProfile: data[0],
                profileIsOpen: true,
              });
            }
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
    const { fileData, loadingView } = this.props;
    const { profileIsOpen } = this.state;
    return (
      <div>
        <div className="mb-3">
          {fileData && (
            <embed
              type={fileData.letterType}
              src={fileData.letterUrl}
              width="100%"
              height="500px"
            />
          )}
          {!fileData && (
            <>
              {loadingView && (
                <>
                  {/* <div className="d-flex justify-content-center">
                    <Spinner
                      className="mb-3 .absolute-center"
                      animation="border"
                      variant="secondary"
                    />
                  </div> */}
                  <div className="d-flex justify-content-center">
                    <OverlayTrigger
                      overlay={
                        <Tooltip id="learn-more">
                          <div>
                            We use <b>Metamask</b> to retrieve your letter{" "}
                            <em>securely</em>. Metamask uses your{" "}
                            <b>Private Key</b> to decrypt the letter. Learn more
                            about <b>Encryption / Decryption</b> in the FAQS.
                          </div>
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        size="lg"
                        className="mr-3"
                      />
                    </OverlayTrigger>
                    <div>See Metamask</div>
                  </div>
                </>
              )}
              {!loadingView && (
                <div className="d-flex justify-content-center">
                  <div>Failed to Decrypt</div>
                  <OverlayTrigger
                    overlay={
                      <Tooltip id="learn-more">
                        <div>
                          Please click <em>confirm</em> on Metamask to decrypt
                          your letter. This is because we use end-to-end
                          encryption to keep your letters secure. See{" "}
                          <b>Encryption / Decryption</b> in the FAQs.
                        </div>
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      size="lg"
                      className="ml-3"
                    />
                  </OverlayTrigger>
                </div>
              )}
            </>
          )}
        </div>

        <Button
          className="mt-3 float-right"
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

export default FileView;
