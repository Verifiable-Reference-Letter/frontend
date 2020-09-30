export default interface Body {
  auth: {
    publicAddress: string;
    jwtToken: string;
  },
  data: any;
}
