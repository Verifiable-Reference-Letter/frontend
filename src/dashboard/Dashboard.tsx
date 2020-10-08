import React from "react";
import UserAuth from "../common/UserAuth.interface";
import { Card } from "react-bootstrap";
import "./Dashboard.css";

const headers = new Headers();
headers.set("Access-Control-Allow-Origin", "*");
headers.set("Content-Type", "application/json");

interface DashboardProps {
  user: UserAuth;
}
interface DashboardState {}

class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1> Dashboard </h1>
        </div>
        <hr></hr>
        <Card.Header>
          Notifications
        </Card.Header>
        <hr></hr>
        <Card.Header>
          Pending
        </Card.Header>
        <hr></hr>
        <div className="dashboard-footer">
          <p> Product of Team Gas</p>
        </div>
      </div>
    );
  }
}
export default Dashboard;
