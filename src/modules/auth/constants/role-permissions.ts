import { Role } from '../../../common/enums/role.enum';

const all = ['*'];

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.SUPER_ADMIN]: all,
  [Role.CHAIRMAN]: all,
  [Role.SECRETARY]: [
    'residents:read',
    'residents:write',
    'complaints:read',
    'complaints:write',
    'finance:read',
  ],
  [Role.TREASURER]: ['finance:read', 'finance:write', 'finance:approve'],
  [Role.JOINT_SECRETARY]: ['residents:read', 'residents:write', 'complaints:write'],
  [Role.COMMITTEE_MEMBER]: ['residents:read', 'complaints:read'],
  [Role.TOWER_CAPTAIN]: ['tower:read', 'tower:write', 'complaints:write'],
  [Role.ACCOUNTANT]: ['finance:read', 'finance:write'],
  [Role.FACILITY_MANAGER]: ['amenities:read', 'amenities:write', 'vendors:read'],
  [Role.SECURITY_SUPERVISOR]: ['security:read', 'security:write'],
  [Role.SECURITY_GUARD]: ['security:write'],
  [Role.MAINTENANCE_STAFF]: ['complaints:update'],
  [Role.OWNER_RESIDENT]: ['resident:self', 'complaints:write', 'payments:write'],
  [Role.OWNER_NONRESIDENT]: ['resident:self', 'tenant:approve'],
  [Role.TENANT]: ['resident:self', 'complaints:write'],
  [Role.FAMILY_MEMBER]: ['resident:view'],
};
