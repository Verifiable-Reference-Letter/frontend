import React from "react";

interface LoginProps {}
interface LoginState {}

class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      file: new FormData(undefined),
    };
  }
}
export default Login;