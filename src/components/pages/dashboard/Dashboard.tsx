import React from "react";
import User from "../../../interfaces/User.interface";
import "./Dashboard.css";

const headers = new Headers();
headers.set("Access-Control-Allow-Origin", "*");
headers.set("Content-Type", "application/json");

interface DashboardProps {
  user: User;
}
interface DashboardState {
}

class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props);
    this.state = {
    };
  }

  render() {

    return (
      <div>
        <div className="dashboard">
          Dashboard
        </div>
      </div>
    );
  }
}
export default Dashboard;
