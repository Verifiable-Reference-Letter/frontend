import React from "react";
import "./FrontPage.css";
import Header from "./Header";
import Body from "./Body";
import VideoBody from "./VideoBody";
import UserAuth from "../common/UserAuth.interface";
import { Card, Modal, Button } from "react-bootstrap";
import Login from "../login/Login";
import gasLogo from './gasLogo.png';
//import video from "./tutorials/loginTutorial.mp4";
const loginVid = require("./tutorials/loginTutorial.mp4");
const requestorVid = require("./tutorials/requestorTutorial.mp4");
const writerVid = require("./tutorials/writerTutorial.mp4");
const recipientVid = require("./tutorials/recipientTutorial.mp4");

interface FrontPageProps {
  user: UserAuth;
  callback: (u: UserAuth) => void;
}

interface FrontPageState {
  signUpLoginIsOpen: boolean;
}

class FrontPage extends React.Component<FrontPageProps, FrontPageState> {
  constructor(props: FrontPageProps) {
    super(props);
    this.state = {
      signUpLoginIsOpen: false,
    };
  }

  async openSignUpLoginModal() {
    this.setState({ signUpLoginIsOpen: true });
  }

  async closeSignUpLoginModal() {
    this.setState({ signUpLoginIsOpen: false });
  }

  render() {
    const { signUpLoginIsOpen } = this.state;

    const header = (
      <div className="header">
        <div>
          <span className="header-title">Team Gas</span>
          <br />
          <br />
          <span className="header-text">
            Verifiable Reference Letters... on the blockchain!
          </span>
        </div>
        <div className="button-blur mt-5">
          <Button
            variant="outline-light"
            onClick={this.openSignUpLoginModal.bind(this)}
          >
            Sign Up / Login
          </Button>
        </div>
      </div>
    );
    return (
      <div id="body">
        <Modal
          id="signup-login-modal"
          show={signUpLoginIsOpen}
          onHide={this.closeSignUpLoginModal.bind(this)}
          //   backdrop="static"
          animation={false}
          className="w-100"
          scrollable={false}
          size="sm"
        >
          <Modal.Header>
            <Modal.Title></Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="login-holder">
              <Login user={this.props.user} callback={this.props.callback} />
            </div>
          </Modal.Body>
        </Modal>
        {/* <Header /> */}
        {header}

        <Body
          className="section bg-darkgrey"
          image={gasLogo}
          title="About the Company"
          description="Team Gas and the verifiable reference letter service aim to streamline and digitize the process of sending reference letters.
                                Currently the process can be a major hassle, especially if professors have many requests from their students. They must send a physical letter
                                in order to verify their identity to the third party that ultimately receives the letter. Additionally, these third parties require a physical
                                letter often because there is no better way to verify the identity of the letter writer. The verifiable reference letter service utilizes blockchain
                                technology and public key encryption to securely send reference letters from one user to another."
        />

        <Body
          className="section bg-grey"
          image={gasLogo}
          title="How it Works"
          description="You can start using our service by creating a Metamask account and then creating an account with us.
                                
                                If you are a student, you can request a letter from any writer that has registered with the website.
                                Select from the drop down menu or type in the name of the person to find the person you want to write you a letter.
                                After you have selected the writer, confirm your choice, and they will receive a request from you.
                                You will receive a notification when they have responded to your request.
                                When you have received a letter, you will be able to select the party that you would like to send the letter to.
                                
                                If you are a teacher, ou will be able to see requests for letters that students have sent to you.
                                To accept a request, simply click on the request and upload a letter that you have written.

                                Lastly, if you are a third party that receives the letter (ie a grad school or hr department of a company), 
                                you will be able to see letters that have been sent to you. You can click on the received letters to view them."
        />

        {/* <Body
          className="section bg-darkgrey"
          image=''
          title="Our Mission"
          description="Our mission is to improve the way people do things through the use of technology."
        /> */}
        
        <VideoBody
          className="section"
          video={loginVid}
          title="Login Tutorial"
        />

        <VideoBody
          className="section"
          video={requestorVid}
          title="Requestor Tutorial"
        />
        <VideoBody
          className="section"
          video={writerVid}
          title="Writer Tutorial"
        />
        <VideoBody
          className="section"
          video={recipientVid}
          title="Recipient Tutorial"
        />
      </div>
    );
  }
}

export default FrontPage;
