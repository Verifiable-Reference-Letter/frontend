import React from "react";
import './Faq.css';

class Faq extends React.Component {
  render() {
    return (
      <div className='section'>
        <div >
        	<br />
        	<br/>
          <span className='bigTitle'>
              Faq Page
          </span>
          <br/>
        	<br/>
        </div>

        <br/>
        <br/>
        <span className='title'>
            Students
        </span>
        <div>
            <span className='question'>
                How do I use the app?
            </span>
            <br />
            <br/>
						<span>
              <text>
              	First set up your metamask account. Then log into the website. From here you can request
              	a letter from any writer that has registered with the website. Select from the drop down 
              	menu or type in the name of the person to find the person you want to write you a letter. 
              	After you have selected the writer, confirm your choice, and they will receive a request from you. 
              	You will receive a notification when they have responded to your request. When you have received
              	a letter, you will be able to select the party that you would like to send the letter to.
              </text>
						</span>
        </div>
        <span className='title'>
            Professors
        </span>
        <div>
            <span className='question'>
                How do I use the app?
            </span>
            <br />
            <br/>
            <span>
                <text>
                	First set up your metamask account. Then log into the website. From here you will be able to see 
                	requests for letters that students have sent to you. To accept a request, simply click on the request 
                	and upload a letter that you have written.
                </text>
            </span>
            <br />
            <br/>
            <span className='question'>
                Why should I use this service?
            </span>
            <br />
            <br/>
            <span>
                <text>
                	The current process of receiving recommendation letter requests and sending those letters is very convoluted,
                	especially regarding aspects of proving your identity to the parties that receive your letter. We offer a 
                	streamlined service that makes the process much easier without compromising security.
                </text>
            </span>
            <br />
            <br/>
        </div>
        <span className='title'>
            Letter Receivers
        </span>
        <div>
            <span className='question'>
                How do I use the app?
            </span>
            <br />
            <br/>
            <span>
                <text>
                	First set up your metamask account. Then log into the website. From here you will be able to 
                	see letters that have been sent to you. You can click on the received letters to view them.
                </text>
            </span>
            <br />
            <br/>
            <span className='question'>
                How can I trust the validity of letters that I receive?
            </span>
            <br />
            <br/>
            <span>
                <text>
                	Our service utilizes a public key encryption method that assures that the letter you receive 
                	is actually from the writer and meant for the person who required the letter. This means you can be
                	confident that the letter is real and contains the original contents.
                </text>
            </span>
            <br />
            <br/>
        </div>
      </div>
    );
  }
}

export default Faq;