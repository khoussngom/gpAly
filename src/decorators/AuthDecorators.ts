export function clientRestricted(message: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function (...args: any[]) {

            console.log(`[CLIENT_RESTRICTED] ${message}`);
            return originalMethod.apply(this, args);
        };
        
        return descriptor;
    };
}

export function auditLog(action: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function (...args: any[]) {
            console.log(`[AUDIT] ${action} - ${new Date().toISOString()}`);
            const result = originalMethod.apply(this, args);
            console.log(`[AUDIT] ${action} - Terminé avec succès`);
            return result;
        };
        
        return descriptor;
    };
}


export function requireRole(role: string, message: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function (...args: any[]) {

            console.log(`[ROLE_CHECK] Rôle requis: ${role} - ${message}`);
            return originalMethod.apply(this, args);
        };
        
        return descriptor;
    };
}

export function isAdmin(message: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function (...args: any[]) {

            console.log(`[ADMIN_CHECK] ${message}`);
            return originalMethod.apply(this, args);
        };
        
        return descriptor;
    };
}


export function requirePermission(permission: string, message: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function (...args: any[]) {

            console.log(`[PERMISSION_CHECK] Permission requise: ${permission} - ${message}`);
            return originalMethod.apply(this, args);
        };
        
        return descriptor;
    };
}
