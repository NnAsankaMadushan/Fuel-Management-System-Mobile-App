const USER_ROLE_ALIASES = {
  vehicleowner: 'vehicle_owner',
  stationowner: 'station_owner',
  stationer: 'station_owner',
  stationoperator: 'station_operator',
  operator: 'station_operator',
};

export const normalizeUserRole = (role) => {
  if (typeof role !== 'string') {
    return role;
  }

  const sanitizedRole = role.trim().toLowerCase().replace(/[\s-]+/g, '_');

  if (!sanitizedRole) {
    return sanitizedRole;
  }

  const collapsedRole = sanitizedRole.replace(/_/g, '');
  return USER_ROLE_ALIASES[sanitizedRole] || USER_ROLE_ALIASES[collapsedRole] || sanitizedRole;
};

export const normalizeUserPayload = (user) => {
  if (!user) {
    return user;
  }

  return {
    ...user,
    role: normalizeUserRole(user.role),
    mustChangePassword: Boolean(user.mustChangePassword),
    emailVerified: user.emailVerified !== false,
  };
};
