import { NextResponse } from 'next/server';
import { processRefund } from '../../../../utils/authHelpers';

export async function POST(request) {
  try {
    // Check for Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    // Verify JWT (assuming a verifyJWT function exists in authHelpers)
    const { verifyJWT } = await import('../../../../utils/authHelpers');
    let user;
    try {
      user = await verifyJWT(token);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    // Check if user is admin
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { orderId, amount, reason } = await request.json();
    // Basic input validation
    if (!orderId || typeof orderId !== 'string' || orderId.length === 0) {
      return NextResponse.json({ error: 'Invalid orderId' }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!reason || typeof reason !== 'string' || reason.length > 256) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
    }
    const result = processRefund(orderId, amount, reason);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' }, 
      { status: 500 }
    );
  }
}