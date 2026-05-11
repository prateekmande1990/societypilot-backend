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
    'complaints:update',
    'finance:read',
    'finance:write',
  ],
  [Role.TREASURER]: ['finance:read', 'finance:write', 'finance:approve'],
  [Role.JOINT_SECRETARY]: [
    'residents:read',
    'residents:write',
    'complaints:write',
    'complaints:update',
  ],
  [Role.COMMITTEE_MEMBER]: ['residents:read', 'complaints:read', 'complaints:write'],
  [Role.TOWER_CAPTAIN]: ['tower:read', 'tower:write', 'complaints:write', 'complaints:read'],
  [Role.ACCOUNTANT]: ['finance:read', 'finance:write'],
  [Role.FACILITY_MANAGER]: ['amenities:read', 'amenities:write', 'vendors:read'],
  [Role.SECURITY_SUPERVISOR]: ['security:read', 'security:write'],
  [Role.SECURITY_GUARD]: ['security:write'],
  [Role.MAINTENANCE_STAFF]: ['complaints:update'],
  [Role.OWNER_RESIDENT]: ['resident:self', 'complaints:write', 'complaints:read', 'payments:write'],
  [Role.OWNER_NONRESIDENT]: ['resident:self', 'tenant:approve', 'complaints:write', 'complaints:read'],
  [Role.TENANT]: ['resident:self', 'complaints:write', 'complaints:read'],
  [Role.FAMILY_MEMBER]: ['resident:view', 'complaints:write', 'complaints:read'],
};
