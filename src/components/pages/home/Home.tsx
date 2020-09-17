import React from "react";
import User from "../../../interfaces/User.interface";
import "./Home.css";

const headers = new Headers();
headers.set("Access-Control-Allow-Origin", "*");
headers.set("Content-Type", "application/json");

interface HomeState {
}

class Home extends React.Component<User, HomeState> {
  constructor(props: User) {
    super(props);
    this.state = {
    };

  }

  render() {

    return (
      <div>
        <div className="home-wrapper">
        </div>
      </div>
    );
  }
}
export default Home;
