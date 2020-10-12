import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";

import UserAuth from "../common/UserAuth.interface";
import LetterHistory from "../common/LetterHistory.interface";
import FileData from "../common/FileData.interface";
import RequestBody from "../common/RequestBody.interface";
import ResponseBody from "../common/ResponseBody.interface";

import CryptService from "../services/CryptService";
import CacheService from "../services/CacheService";

import FileView from "../components/FileView/FileView";

import "./Recipient.css";

interface RecipientProps {
  user: UserAuth;
}
interface RecipientState {
  letters: LetterHistory[];
  viewIsOpen: boolean;
  selectedLetterKey: number;
  selectedLetterId: string;
  fileData?: FileData;
}

class Recipient extends React.Component<RecipientProps, RecipientState> {
  private viewModal = React.createRef<FileView>();
  private cryptService: CryptService;
  private cacheService: CacheService<string, string>;

  componentWillMount() {
    // api call to get letterhistory

    const letterFetchUrl = `/api/v1/letters/received`;
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
    fetch(`${process.env.REACT_APP_BACKEND_URL}${letterFetchUrl}`, init)
      .then((response) => {
        response
          .json()
          .then((body: ResponseBody) => {
            const data: LetterHistory[] = body.data;
            console.log(response);
            if (data) {
              this.setState({
                letters: data,
              });
            } else {
              console.log("problem with response data for requestor");
            }
          })
          .catch((e: Error) => {
            console.log(e);
          });
      })
      .catch((e: Error) => {
        console.log(e);
      });
    // this.setState({
    //   letters: [
    //     {
    //       letterId: "1",
    //       writer: {
    //         name: "Mary Poppins",
    //         publicAddress: "0x314159265358979323",
    //       },
    //       requestor: {
    //         name: "Simba",
    //         publicAddress: "0xabcdefghijklmnop",
    //       },
    //       requestedAt: null,
    //       uploadedAt: null,
    //       recipient: {
    //         name: "Curious George",
    //         publicAddress: "0x142857142857142857",
    //       },
    //       sentAt: null,
    //     },
    //     {
    //       letterId: "2",
    //       writer: {
    //         name: "Mary Poppins",
    //         publicAddress: "0x314159265358979323",
    //       },
    //       requestor: {
    //         name: "Curious George",
    //         publicAddress: "0x142857142857142857",
    //       },
    //       requestedAt: null,
    //       uploadedAt: null,
    //       recipient: {
    //         name: "Curious George",
    //         publicAddress: "0x142857142857142857",
    //       },
    //       sentAt: null,
    //     },
    //   ],
    // });
  }

  constructor(props: RecipientProps) {
    super(props);
    this.state = {
      letters: [],
      viewIsOpen: false,
      selectedLetterKey: -1,
      selectedLetterId: "",
    };
    this.cryptService = new CryptService();
    this.cacheService = new CacheService(1);
  }

  async openViewModal(key: number) {
    console.log("opening view modal");
    const letterId = this.state.letters[key].letterId;
    const fetchUrl = `/api/v1/users/${this.props.user.publicAddress}/letters/${letterId}/content`;
    let encryptedLetter = this.cacheService.get(letterId);
    if (encryptedLetter === null) {
      this.retrieveContentsFromServer(fetchUrl, key);
    } else {
      let fileData = await this.cryptService.decrypt(
        encryptedLetter,
        this.props.user.publicAddress
      );
      console.log("fileData", fileData);
      if (fileData) {
        this.setState({
          fileData: fileData,
          viewIsOpen: true,
          selectedLetterKey: key,
          selectedLetterId: letterId,
        });
      }
    }
  }

  closeViewModal() {
    console.log("closing view modal");
    this.setState({ viewIsOpen: false });
  }

  async retrieveContentsFromServer(fetchUrl: string, key: number) {
    console.log("retrieving letter contents from server");
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
    const letterId = this.state.letters[key].letterId;
    // get letter from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`, init)
      .then((response) => {
        console.log("logging response");
        console.log(response);
        return response.json();
      })
      .then((encryptedLetter) => {
        // decrypt letter
        this.cryptService
          .decrypt(encryptedLetter, this.props.user.publicAddress)
          .then((fileData) => {
            if (fileData) {
              this.setState({
                fileData: fileData,
                viewIsOpen: true,
                selectedLetterKey: key,
                selectedLetterId: letterId,
              });
            }
          });
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  getRequestor() {
    return this.state.letters[this.state.selectedLetterKey]?.letterRequestor;
  }

  getWriter() {
    return this.state.letters[this.state.selectedLetterKey]?.letterWriter;
  }

  render() {
    const { name } = this.props.user;
    const { letters, viewIsOpen, selectedLetterId } = this.state;

    const lettersList = letters.map((l, k) => (
      <Row key={k}>
        <div className="full-width">
          <span className="text-float-left">({l.letterId})&nbsp;</span>
          <span className="text-float-left">For: {l.letterRequestor.name}</span>
          <Button
            className="left-float-right-button"
            onClick={() => {
              this.openViewModal(k);
            }}
          >
            View
          </Button>
        </div>
      </Row>
    ));

    return (
      <div className="recipient">
        <Modal
          id="view-modal"
          show={viewIsOpen}
          onHide={this.closeViewModal.bind(this)}
          backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          // size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Letter for {this.getRequestor()?.name} by {this.getWriter?.name} (
              {selectedLetterId})
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FileView
              ref={this.viewModal}
              user={this.props.user}
              letter={letters[this.state.selectedLetterKey]}
              onClose={this.closeViewModal.bind(this)}
            ></FileView>
          </Modal.Body>
        </Modal>

        <div className="recipient-header">
          <h1> Recipient Page </h1>
          <p>
            <em>{name}</em>
          </p>
          <hr></hr>
        </div>

        <div className="letters">
          <h3> Letters </h3>
          <Container fluid>{lettersList}</Container>
          <hr></hr>
        </div>

        <div className="recipient-footer">
          <p> Product of Team Gas</p>
        </div>
      </div>
    );
  }
}
export default Recipient;
