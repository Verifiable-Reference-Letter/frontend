import React from "react";
import { Component } from "react";
export const MContext = React.createContext(null);  //exporting context object
class MessageSender extends Component {
    state = { message: "" }
    render() {
        return (
            <MContext.Provider value={
                {
                    state: this.state,
                    setMessage: (value: any) => this.setState({
                        message: value
                    })
                }}>
                {this.props.children}   //this indicates that all the child tags with MyProvider as Parent can access the global store.
            </MContext.Provider>
        );
    }
}

export default MessageSender;