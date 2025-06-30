import { NextResponse } from 'next/server';
import { DatabaseConfig } from '../../../../utils/DatabaseConfig';
import { UserService } from '../../../../utils/UserService';

export async function POST(request) {
  try {
    const searchParams = await request.json();
    
    const config = new DatabaseConfig();
    const userService = new UserService(config);
    
    const results = await userService.searchUsers(searchParams);
    
    return NextResponse.json({
      success: true,
      results,
      count: results.length
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}