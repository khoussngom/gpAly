"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRestricted = clientRestricted;
exports.auditLog = auditLog;
exports.requireRole = requireRole;
exports.isAdmin = isAdmin;
exports.requirePermission = requirePermission;
function clientRestricted(message) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            console.log(`[CLIENT_RESTRICTED] ${message}`);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
function auditLog(action) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            console.log(`[AUDIT] ${action} - ${new Date().toISOString()}`);
            const result = originalMethod.apply(this, args);
            console.log(`[AUDIT] ${action} - Terminé avec succès`);
            return result;
        };
        return descriptor;
    };
}
function requireRole(role, message) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            console.log(`[ROLE_CHECK] Rôle requis: ${role} - ${message}`);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
function isAdmin(message) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            console.log(`[ADMIN_CHECK] ${message}`);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
function requirePermission(permission, message) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            console.log(`[PERMISSION_CHECK] Permission requise: ${permission} - ${message}`);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
