import * as PrismaClient from '@prisma/client';

const userWithAccounts =
  PrismaClient.Prisma.validator<PrismaClient.Prisma.usersArgs>()({
    include: { accounts: true },
  });
type UserWithAccounts = PrismaClient.Prisma.usersGetPayload<
  typeof userWithAccounts
>;

type UserAuthObject = {
  username: string;
  password: string;
  id: string;
};

type UserSession = {
  username: string;
  sub: number;
  iat: number;
  exp: number;
};

export { UserWithAccounts, UserAuthObject, UserSession };
