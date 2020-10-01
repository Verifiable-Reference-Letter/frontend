import React from "react";
import { Button, Table } from "react-bootstrap";
import UserAuth from "../../common/User.interface";
import "./Profile.css";

interface ProfileProps {
  user: UserAuth;
  onClose: () => void;
}
interface ProfileState {}

class Profile extends React.Component<ProfileProps, ProfileState> {
  componentWillMount() {
    // make query for all other user information
  }

  constructor(props: ProfileProps) {
    super(props);
    this.state = {};
  }

  /*decryptLetter(letter: string) {
    console.log("decrypting letter");
    return new File([""], "filename.pdf", {type: "application/pdf"});
  }*/

  render() {
    const { user } = this.props;
    return (
      <div>
        <div className="mb-3">
          <Table hover className="border border-secondary">
            <thead>
              <tr>
                <th className="border border-secondary .bg-secondary">
                  User Name
                </th>
                <th className="border border-secondary">Public Address</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-secondary">{user.name}</td>
                <td className="border border-secondary">
                  {user.publicAddress}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>

        <Button
          className="form-button"
          onClick={(e: any) => {
            this.props.onClose();
          }}
        >
          Close
        </Button>
      </div>
    );
  }
}

export default Profile;
