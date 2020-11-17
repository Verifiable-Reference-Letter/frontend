import React from "react";

class Header extends React.Component {
    render() {
        return (
            <div className='header'>
                <span className='header-title'>
                    Team Gas
                </span>
                <br/>
                <br/>
                <span className="header-text">
                    Verifiable Reference Letters... on the blockchain!
                </span>
            </div>
        );
    }
}
export default Header;