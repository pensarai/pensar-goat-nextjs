import { NextResponse } from 'next/server';
import { processRefund, getSession } from '../../../../utils/authHelpers';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Retrieve cookies from the request
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session')?.value;

    // Validate session and authorization
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const session = await getSession(sessionToken);
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin authorization required' },
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