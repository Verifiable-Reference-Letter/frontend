export default interface RequestBody {
  auth: {
    publicAddress: string;
    jwtToken: string;
  },
  data: any;
}
