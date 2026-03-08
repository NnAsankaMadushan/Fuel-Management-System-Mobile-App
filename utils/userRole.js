const USER_ROLE_ALIASES = {
  vehicleowner: 'vehicle_owner',
  stationowner: 'station_owner',
  stationer: 'station_owner',
  stationoperator: 'station_operator',
  operator: 'station_operator',
};

const USER_ROLE_LABELS = {
  vehicle_owner: 'Vehicle Owner',
  station_owner: 'Station Owner',
  station_operator: 'Station Operator',
  admin: 'Admin',
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

export const getUserRoleLabel = (role) => {
  const normalizedRole = normalizeUserRole(role);
  if (!normalizedRole) {
    return 'User';
  }

  return (
    USER_ROLE_LABELS[normalizedRole] ||
    String(normalizedRole)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
};
