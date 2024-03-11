import { RolesBuilder } from 'nest-access-control';
import { Role } from '../../common/constants';

export const RBAC_POLICY: RolesBuilder = new RolesBuilder();

// prettier-ignore
RBAC_POLICY
  .grant(Role.USER)
    .read('employeeData')
  .grant(Role.CLIENT)
    .extend(Role.USER)
    .read('managedEmployeeData')
    .readOwn('employerData')
    .update('managedEmployeeData')
  .grant(Role.ADMIN)
    .extend(Role.CLIENT)
    .read('employeeData')
    .update('employeeData')
    .delete('employeeData')
  .deny(Role.ADMIN)
    .read('managedEmployeeData')
