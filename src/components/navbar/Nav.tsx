import React from "react";
import { Link } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Dropdown from "react-bootstrap/Dropdown";
import "./Nav.css";

import * as ROUTES from "../../common/routes";

type NavProps = {
  publicAddress: string;
  connected: boolean;
  onConnect: () => void;
};
type NavState = {};

class Nav extends React.Component<NavProps, NavState> {
  constructor(props: any) {
    super(props);
    this.onConnect = this.onConnect.bind(this);
  }

  onConnect() {
    // callback
    this.props.onConnect();
  }

  render() {
    return (
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="/home">ETC Reference Letter dApp</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {!this.props.connected && (
            <input type="button" onClick={this.onConnect} value="Connect" />
          )}
          {this.props.connected && (
            <Navbar.Text className="navText">
              Signed in as:{" "}
              <a>
                {this.props.connected ? this.props.publicAddress : "--"}
              </a>
            </Navbar.Text>
          )}
        </Navbar.Collapse>
        <Dropdown>
          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
            Menu
          </Dropdown.Toggle>

          <Dropdown.Menu alignRight={true}>
            <Link to={ROUTES.HOME} style={{ textDecoration: "none" }}>
              <li>
                <Dropdown.Item href="#/action-0">Home</Dropdown.Item>
              </li>
            </Link>
            <Link to={ROUTES.LOGIN} style={{ textDecoration: "none" }}>
              <li>
                <Dropdown.Item href="#/action-1">Login</Dropdown.Item>
              </li>
            </Link>
            <Link to={ROUTES.REQUESTOR} style={{ textDecoration: "none" }}>
              <li>
                <Dropdown.Item href="#/action-2">Requestor</Dropdown.Item>
              </li>
            </Link>

            <Link to={ROUTES.RECIPIENT} style={{ textDecoration: "none" }}>
              <li>
                <Dropdown.Item href="#/action-3">Recipient</Dropdown.Item>
              </li>
            </Link>

            <Link to={ROUTES.WRITER} style={{ textDecoration: "none" }}>
              <li>
                <Dropdown.Item href="#/action-4">Writer</Dropdown.Item>
              </li>
            </Link>
          </Dropdown.Menu>
        </Dropdown>
      </Navbar>
    );
  }
}
export default Nav;
