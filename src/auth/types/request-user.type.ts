export type RequestUser = {
  id: number;
  email: string;
  role: {
    id: number;
    name: string;
    slug: string;
  };
  permissions: string[];
};
