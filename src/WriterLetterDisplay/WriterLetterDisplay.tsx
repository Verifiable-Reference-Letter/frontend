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
import UserKey from "../common/UserKey.interface";
import User from "../common/User.interface";
import LetterHistory from "../common/LetterHistory.interface";
import RequestBody from "../common/RequestBody.interface";
import ResponseBody from "../common/ResponseBody.interface";
import "./WriterLetterDisplay.css";
import LetterDetails from "../common/LetterDetails.interface";

import FileData from "../common/FileData.interface";
import CryptService from "../services/CryptService";
import CacheService from "../services/CacheService";

import FileUpload from "../components/FileUpload/FileUpload";
import FileView from "../components/FileView/FileView";
import Confirm from "../components/Confirm/Confirm";
import Send from "../components/Send/Send";
import FileHistory from "../components/FileHistory";
import Profile from "../components/Profile";

interface WriterLetterDisplayProps {
  user: UserAuth;
  letter: LetterDetails;
  numRecipients: Number;
  numUnsentRecipients: Number;
  onReload(): Promise<void>;
}
interface WriterLetterDisplayState {
  history: LetterHistory[];
  loadingHistory: boolean;
  loadingSend: boolean;
  profileIsOpen: boolean;
  historyIsOpen: boolean;
  messageIsOpen: boolean;
  uploadIsOpen: boolean;
  sendIsOpen: boolean;
  viewIsOpen: boolean;
  confirmIsOpen: boolean;
  collapseIsOpen: boolean;
  selectedUserProfile?: UserProfile;
  uploadedFile?: File;
  fileData?: FileData;
  unsentRecipientKeys: UserKey[];
}

class WriterLetterDisplay extends React.Component<
  WriterLetterDisplayProps,
  WriterLetterDisplayState
> {
  private uploadModal = React.createRef<FileUpload>();
  private viewModal = React.createRef<FileView>();
  private userProfiles: Map<string, UserProfile>;
  private cryptService: CryptService;
  private cacheService: CacheService<string, string>;

  constructor(props: WriterLetterDisplayProps) {
    super(props);
    this.state = {
      history: [],
      unsentRecipientKeys: [],
      loadingHistory: false,
      loadingSend: false,
      profileIsOpen: false,
      historyIsOpen: false,
      messageIsOpen: false,
      uploadIsOpen: false,
      sendIsOpen: false,
      viewIsOpen: false,
      confirmIsOpen: false,
      collapseIsOpen: false,
    };

    this.userProfiles = new Map<string, UserProfile>();
    this.cryptService = new CryptService();
    this.cacheService = new CacheService(1);
  }

  async openUploadModal() {
    console.log("opening upload modal");
    this.setState({
      uploadIsOpen: true,
      collapseIsOpen: true,
    });
  }

  async onUploadSubmit() {
    const fetchUrl = `/api/v1/letters/${this.props.letter.letterId}/contents/update`;
    if (this.state.uploadedFile !== undefined) {
      await this.uploadContentsToServer(this.state.uploadedFile, fetchUrl);
    }
  }

  async closeUploadModal() {
    console.log("closing upload modal");
    this.setState({
      confirmIsOpen: false,
      uploadIsOpen: false,
      collapseIsOpen: this.state.historyIsOpen,
    });
  }

  async uploadContentsToServer(file: File, fetchUrl: string) {
    console.log("uploading to server");
    console.log(file);

    // This should be what I change
    //  1. Encryt w/recipients public key
    //  2. Sign
    //  3. Send to server
    let signLetter = await this.cryptService.sign(
      file,
      this.props.user.publicAddress
    );
    console.log("Encrypt: " + signLetter);

    // encrypt file
    let encryptedFile = await this.cryptService.encrypt(
      file,
      this.props.user.publicAddress
    );
    console.log(encryptedFile);

    if (!encryptedFile) {
      console.log("encryption failed");
      this.closeUploadModal();
      return;
    }

    // cache encrypted file
    // this.cacheService.put(this.props.letter.letterId, encryptedFile);
    // console.log("put encryptedFile into memcache");

    // post encrypted file to server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`, {
      body: JSON.stringify({
        auth: {
          publicAddress: this.props.user.publicAddress,
          jwtToken: this.props.user.jwtToken,
        },
        data: encryptedFile,
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "application/json",
      },
      method: "POST",
    })
      .then((response: any) => {
        console.log(response.status);
        if (response.status === 200) {
          this.closeUploadModal();
          this.props.onReload();
        } else {
          this.uploadModal.current!.changeDisplayMessage(
            "Upload Failed. Try Again Later."
          );
        }
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  async openSendModal() {
    this.setState({ sendIsOpen: true });
    if (
      this.props.numUnsentRecipients > 0 &&
      this.props.letter.uploadedAt !== null
    ) {
      const fetchUrl = `/api/v1/letters/${this.props.letter.letterId}/unsentRecipientKeys`;
      this.retrieveUnsentRecipientKeysFromServer(fetchUrl);
    }
  }

  async closeSendModal() {
    this.setState({ sendIsOpen: false });
  }

  async onSendSubmit() {
    // closed send and repopulate letter list; can be optimized
    this.closeSendModal();
    this.props.onReload();
  }

  async retrieveUnsentRecipientKeysFromServer(fetchUrl: string) {
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
        // loadingSelect: false,
        // selectIsOpen: false,
        // collapseIsOpen: this.state.historyIsOpen,
        // });
      } else {
        let body = await response.json();

        const data: { userKeys: UserKey[]; users: User[] } = body.data;
        console.log(response);
        console.log(data);
        this.setState({
          unsentRecipientKeys: data.userKeys,
          loadingSend: false,
        });
      }
    } catch (e) {
      console.log(e);
      // this.setState({
      // loadingSelect: false,
      // selectIsOpen: false,
      // collapseIsOpen: this.state.historyIsOpen,
      // });
    }
  }

  async openViewModal() {
    console.log("opening view modal");
    this.setState({ viewIsOpen: true });
    const letterId = this.props.letter.letterId;
    const fetchUrl = `/api/v1/letters/${letterId}/contents/writer`;
    console.log(letterId);
    let encryptedLetter = this.cacheService.get(letterId);
    if (encryptedLetter === null) {
      this.retrieveLetterContentsFromServer(fetchUrl);
    } else {
      try {
        let fileData = await this.cryptService.decrypt(
          encryptedLetter,
          this.props.user.publicAddress
        );

        console.log(fileData.letterType);
        this.setState({
          fileData: fileData,
        });
      } catch (error) {
        console.log("error with decryption");
      }
    }
  }

  closeViewModal() {
    console.log("closing view modal");
    this.setState({ viewIsOpen: false, fileData: undefined });
  }

  retrieveLetterContentsFromServer(fetchUrl: string) {
    console.log("retrieving from server");
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
    const letterId = this.props.letter.letterId;
    // get letter from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`, init)
      .then((response) => {
        console.log("logging response");
        console.log(response);
        return response.json();
      })
      .then((body) => {
        // decrypt letter
        const encryptedLetter: string = body.data;
        if (encryptedLetter) {
          this.cryptService
            .decrypt(encryptedLetter, this.props.user.publicAddress)
            .then((fileData) => {
              if (fileData) {
                this.setState({
                  viewIsOpen: true,
                  fileData: fileData,
                });
              }
            });
        } else {
          this.setState({
            viewIsOpen: false,
          });
        }
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  async openMessageModal(file: File) {
    this.setState({ uploadedFile: file, messageIsOpen: true });
    this.openConfirmModal();
  }

  async closeMessageModal() {
    this.setState({ messageIsOpen: false });
  }

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
      collapseIsOpen: this.state.viewIsOpen,
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
    const { user, letter, numRecipients, numUnsentRecipients } = this.props;
    const {
      history,
      loadingHistory,
      loadingSend,
      profileIsOpen,
      historyIsOpen,
      messageIsOpen,
      uploadIsOpen,
      sendIsOpen,
      viewIsOpen,
      confirmIsOpen,
      collapseIsOpen,
      unsentRecipientKeys,
    } = this.state;

    return (
      <div>
        <Card className="full-width opacity-0">
          <Card.Header
            className="d-flex justify-content-between button-blur letter-entry"
            onClick={() => this.setState({ collapseIsOpen: !collapseIsOpen })}
          >
            <div className="flex-fill">
              <span className="mr-3">For:</span>
              <Button
                variant="outline-light"
                onClick={(e: any) => {
                  e.stopPropagation();
                  this.openProfileModal(letter.letterRequestor.publicAddress);
                }}
              >
                {letter.letterRequestor?.name}
              </Button>
            </div>

            {numUnsentRecipients > 0 && letter.uploadedAt !== null && (
              <Button
                // TODO: add Tooltip
                variant="outline-light"
                className="flex-shrink-1 float-right ml-3"
                onClick={(e: any) => {
                  e.stopPropagation();
                  if (sendIsOpen) {
                    this.closeSendModal();
                  } else {
                    this.openSendModal();
                  }
                }}
              >
                Send
              </Button>
            )}
            <Button
              // TODO: add Tooltip
              disabled={numRecipients > 0}
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
                if (uploadIsOpen) {
                  this.closeUploadModal();
                } else {
                  this.openUploadModal();
                }
              }}
            >
              Upload
            </Button>
            <Button
              // TODO: add Tooltip
              disabled={letter.uploadedAt === null}
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
                if (viewIsOpen) {
                  this.closeViewModal();
                } else {
                  this.openViewModal();
                }
              }}
            >
              View
            </Button>
            <Button
              // TODO: add Tooltip
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
              // TODO: add Tooltip
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
            {sendIsOpen && <div>Send Letter Component</div>}
            {uploadIsOpen && (
              <div>
                <FileUpload
                  ref={this.uploadModal}
                  user={this.props.user}
                  restrictPdf={true}
                  onUpload={this.openMessageModal.bind(this)}
                  onClose={this.closeUploadModal.bind(this)}
                ></FileUpload>
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
            {!uploadIsOpen && !historyIsOpen && (
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
              onConfirm={this.onUploadSubmit.bind(this)}
              onClose={this.closeConfirmModal.bind(this)}
            />
          </Modal.Body>
        </Modal>

        <Modal
          id="send-modal"
          show={sendIsOpen}
          onHide={this.closeSendModal.bind(this)}
          // backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          // size="sm"
        >
          <Modal.Header closeButton>
            <Modal.Title>List of Recipients</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Send
              user={this.props.user}
              letter={this.props.letter}
              unsentRecipientKeys={this.state.unsentRecipientKeys}
              onClose={this.onSendSubmit.bind(this)}
            />
          </Modal.Body>
        </Modal>

        <Modal
          id="view-modal"
          show={viewIsOpen}
          onHide={this.closeViewModal.bind(this)}
          backdrop="static"
          animation={false}
          className="modal view-modal"
          scrollable={false}
          size="xl"
        >
          <Modal.Header closeButton>
            <Modal.Title>For: {letter.letterRequestor?.name}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FileView
              fileData={this.state.fileData}
              ref={this.viewModal}
              user={this.props.user}
              onClose={this.closeViewModal.bind(this)}
            ></FileView>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default WriterLetterDisplay;
