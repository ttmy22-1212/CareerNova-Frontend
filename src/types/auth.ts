import { User } from "./user";

export interface RegisterValues
  extends Pick<User, "email" | "password" | "name"> {}
