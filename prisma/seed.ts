import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import { Role } from '../src/common/constants';
import { generatePasswordHash } from '../src/common/utils/util';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = generatePasswordHash('admin12345');
  await prisma.admins.create({
    data: {
      name: 'admin',
      role: 0,
      accounts: {
        create: {
          email: 'admin@admin.com',
          account_type: Role.ADMIN,
          encrypted_password: hashedPassword,
          created_at: moment().format(),
          updated_at: moment().format(),
        },
      },
      addresses: {
        create: {
          city: 'admin City',
          region: 'admin region',
          street: 'admin street',
          primary_phone_number: '677777777',
          secondery_phone_number: '678787878',
          created_at: moment().format(),
          updated_at: moment().format(),
        },
      },
      created_at: moment().format(),
      updated_at: moment().format(),
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
