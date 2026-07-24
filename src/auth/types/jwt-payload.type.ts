export type JwtPayload = {
  sub: number;
  email: string;
  role: {
    id: number;
    name: string;
    slug: string;
  };
  permissions: string[];
};
