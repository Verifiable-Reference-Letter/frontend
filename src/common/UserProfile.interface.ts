export default interface UserProfile {
  publicAddress: string,
  name: string,
  profile_image: Buffer | null,
  createdAt: Date,
}