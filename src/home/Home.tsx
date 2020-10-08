import React from "react";
import { Link, Redirect } from "react-router-dom";
import { Button } from "react-bootstrap";
import User from "../common/UserAuth.interface";
import * as ROUTES from "../routes";
import "./Home.css";

const headers = new Headers();
headers.set("Access-Control-Allow-Origin", "*");
headers.set("Content-Type", "application/json");

interface HomeProps {
  user: User;
}
interface HomeState {}

class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="home">
        <Redirect to="/login" />
      </div>
    );
  }
}
export default Home;
