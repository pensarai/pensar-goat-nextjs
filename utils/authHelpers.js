import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

/**
 * Retrieves sensitive user data.
 * Only allows the user themselves or an admin to access this information.
 * @param {number|string} requestedUserId - The userId whose data is requested
 * @param {number|string} authUserId - The authenticated user's userId
 * @param {boolean} isAdmin - Whether the authenticated user is an admin
 * @throws {Error} if access is unauthorized
 */
export function getUserSensitiveData(requestedUserId, authUserId, isAdmin = false) {
  if (
    String(requestedUserId) !== String(authUserId) &&
    !isAdmin
  ) {
    throw new Error('Unauthorized access to sensitive user data');
  }

  return {
    userId: requestedUserId,
    email: `user${requestedUserId}@example.com`,
    socialSecurityNumber: `***-**-${requestedUserId.toString().padStart(4, '0')}`,
    creditScore: 750 + (requestedUserId % 100),
    bankAccount: `****${requestedUserId.toString().padStart(4, '0')}`,
    medicalRecord: `Patient ${requestedUserId} - Confidential Information`
  };
}

export function getAdminDashboardStats() {
  return {
    totalUsers: 1250,
    activeUsers: 892,
    revenue: 45000,
    pendingOrders: 23,
    criticalAlerts: 3,
    systemHealth: "OK"
  };
}

export function processRefund(orderId, amount, reason) {
  console.log(`Processing refund: $${amount} for order ${orderId}`);
  
  return {
    refundId: `REF_${Date.now()}`,
    amount,
    orderId,
    reason,
    processedAt: new Date().toISOString(),
    status: "PROCESSED"
  };
}

export function deleteUserAccount(userId, reason) {
  console.log(`Deleting user account ${userId}: ${reason}`);
  
  return {
    deletedUserId: userId,
    deletedAt: new Date().toISOString(),
    reason,
    recoverable: false
  };
}

export async function getUserFromDB(username) {
  return {
    id: parseInt(username) || 1,
    username,
    hashedPassword: await bcrypt.hash('password123', 10),
    isAdmin: username === 'admin'
  };
}

export async function deleteUserFromDB(userId) {
  console.log(`Deleting user ${userId} from database`);
  return { deleted: true, userId };
}
