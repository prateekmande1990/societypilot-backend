export type JwtPayload = {
  userId: string;
  societyId: string;
  role: string;
  flatId: string | null;
  towerId: string | null;
  permissions: string[];
};
