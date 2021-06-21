import { User } from "../models";

export async function getUser(userId) {
  const user = await User.findById(userId)
  return user
}
