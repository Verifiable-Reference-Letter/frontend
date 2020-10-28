import React from "react";
import { Button, Image, Card, Spinner } from "react-bootstrap";
import UserProfile from "../../common/UserProfile.interface";
import "./Profile.css";

interface ProfileProps {
  user?: UserProfile;
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

  render() {
    const { user } = this.props;
    return (
      <div>
        {user && (
          <div className="d-flex mb-2">
            <Card className="flex-fill">
              <div className="m-2">
                <div className="">Name: {user.name}</div>
                {/* <div className="text-break">ID: {user.publicAddress}</div> */}
              </div>
            </Card>
            <div className="ml-4 flex-shrink-1 float-right image-card">
              <Image
                className="profile-image"
                src="https://engineering.lehigh.edu/sites/engineering.lehigh.edu/files/styles/faculty_photo/public/korth.jpg?itok=GfxQ6zFl"
              />
            </div>
          </div>
        )}
        {!user && (
          <div className="d-flex justify-content-center">
            <Spinner
              className="float-right mt-4 mr-3"
              animation="border"
              variant="secondary"
            />
          </div>
        )}

        <Button
          className="mt-3 float-right"
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
