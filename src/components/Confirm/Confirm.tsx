import React from "react";
import { Button, Image, Card } from "react-bootstrap";
import UserAuth from "../../common/User.interface";
import "./Confirm.css";

interface ConfirmProps {
  user: UserAuth;
  onClose: () => void;
}
interface ConfirmState {}

class Confirm extends React.Component<ConfirmProps, ConfirmState> {
  
  constructor(props: ConfirmProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
      </div>
    );
  }
}

export default Confirm;
