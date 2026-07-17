import { Role } from "@prisma/client";

export type RequestUser = {
  id: number;
  email: string;
  role: Role;
};
