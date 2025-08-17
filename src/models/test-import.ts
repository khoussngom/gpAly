import { clientRestricted, auditLog, requireRole, isAdmin, requirePermission } from '../decorators/AuthDecorators';

console.log('Import successful');
console.log(typeof clientRestricted);
