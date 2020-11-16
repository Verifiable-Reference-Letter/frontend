import React from "react";
import UserAuth from "../common/UserAuth.interface";
import {withRouter} from 'react-router';
import { Card, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import * as ROUTES from "../routes";
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
      <Col className="dashboard h-100 flex-column d-flex">
        {/* <Row className="dashboard-header h-50">
          <h3>Dashboard</h3>
          <Col>
            <h5>Notifications</h5>
            <div className="dashboard-notifications"></div>
          </Col>
        </Row> */}
        <Row className="dashboard-header">
          <h3>Dashboard</h3>
        </Row>
        <Row className="dashboard-body d-flex h-100">
        <Col className='mt-5 mb-5'>
            <Link to={ROUTES.REQUESTOR} className="text-white-50 h-100">
              <Card.Header className="dashboard-redirects h-100 d-flex justify-content-center align-items-center">
                <h1>Requestor</h1>
              </Card.Header>
            </Link>
          </Col>
          <Col className='mt-5 mb-5'>
            <Link to={ROUTES.WRITER} className="text-white-50 h-100">
              <Card.Header className="dashboard-redirects h-100 d-flex justify-content-center align-items-center">
                <h1>Writer</h1>
              </Card.Header>
            </Link>
          </Col>
          <Col className='mt-5 mb-5'>
            <Link to={ROUTES.RECIPIENT} className="text-white-50 h-100">
              <Card.Header className="dashboard-redirects h-100 d-flex justify-content-center align-items-center">
                <h1>Recipient</h1>
              </Card.Header>
            </Link>
          </Col>
        </Row>
      </Col>
    );
  }
}
export default Dashboard;
