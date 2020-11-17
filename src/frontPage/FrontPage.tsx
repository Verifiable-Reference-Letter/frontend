import React from "react";
import './FrontPage.css';
import Header from "./Header";
import Body from "./Body";
import MContext from "../MessageSender";
// import SlideDeck from "./SlideDeck";


class FrontPage extends React.Component {
    render() {
        const body = (
            <div id="body">
                <Header />
                <Body
                    className='section'
                    img='./Capture1.PNG'
                    title='About the Company'
                    description='Team Gas and the verifiable reference letter service aim to streamline and digitize the process of sending reference letters.
                                Currently the process can be a major hassle, especially if professors have many requests from their students. They must send a physical letter
                                in order to verify their identity to the third party that ultimately receives the letter. Additionally, these third parties require a physical
                                letter often because there is no better way to verify the identity of the letter writer. The verifiable reference letter service utilizes blockchain
                                technology and public key encryption to securely send reference letters from one user to another.'
                />

                <Body
                    className='section bg-grey'
                    img='./metamask.PNG'
                    title='How it Works'
                    description='You can start using our service by creating a Metamask account and then creating an account with us.
                                
                                If you are a student, you can request a letter from any writer that has registered with the website.
                                Select from the drop down menu or type in the name of the person to find the person you want to write you a letter.
                                After you have selected the writer, confirm your choice, and they will receive a request from you.
                                You will receive a notification when they have responded to your request.
                                When you have received a letter, you will be able to select the party that you would like to send the letter to.
                                
                                If you are a teacher, ou will be able to see requests for letters that students have sent to you.
                                To accept a request, simply click on the request and upload a letter that you have written.

                                Lastly, if you are a third party that receives the letter (ie a grad school or hr department of a company), 
                                you will be able to see letters that have been sent to you. You can click on the received letters to view them.
                                '
                />

                <Body
                    className='section bg-darkgrey'
                    img='./Capture1.PNG'
                    title='Our Mission'
                    description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                                minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                aliquip ex ea commodo consequat. Duis aute irure dolor in
                                reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                pariatur.'
                />
            </div>
        )
        const blank = (
            <div></div>
        )
        return (
            <div>
                <MContext.Consumer>
                    {(context: { state: { message: boolean; }; }) => (
                        <p>{context.state.message}</p>)}
                </MContext.Consumer>
            </div>
        );
    }
}

export default FrontPage;