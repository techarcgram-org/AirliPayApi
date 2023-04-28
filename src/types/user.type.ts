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

export { UserWithAccounts, UserAuthObject };
