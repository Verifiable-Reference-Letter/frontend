import React from "react";
import User from "../../../interfaces/User.interface";
import "./Home.css";

const headers = new Headers();
headers.set("Access-Control-Allow-Origin", "*");
headers.set("Content-Type", "application/json");

interface HomeProps {
  user: User;
}
interface HomeState {
}

class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
    };
  }

  render() {

    return (
      <div>
        <div className="home">
          Home
        </div>
      </div>
    );
  }
}
export default Home;
