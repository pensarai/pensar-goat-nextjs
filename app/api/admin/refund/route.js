import { NextResponse } from 'next/server';
import { processRefund } from '../../../../utils/authHelpers';
import { verifyAuthToken } from '../../../../utils/authHelpers'; // Assumed existing function for JWT/auth checks

export async function POST(request) {
  try {
    // Extract the Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring('Bearer '.length).trim();

    let user;
    try {
      user = await verifyAuthToken(token);
    } catch (authError) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!user || !user.role || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privilege required' },
        { status: 403 }
      );
    }

    const { orderId, amount, reason } = await request.json();

    const result = processRefund(orderId, amount, reason);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' }, 
      { status: 500 }
    );
  }
}