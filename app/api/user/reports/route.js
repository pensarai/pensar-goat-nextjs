import { NextResponse } from 'next/server';
import { getConnection } from '../../../../utils/database';

// User report management system
async function getUserReports(userId, reportType) {
  // report_type comes from a dropdown with predefined values
  const VALID_REPORT_TYPES = ['monthly', 'quarterly', 'annual', 'summary'];
  
  const connection = await getConnection();
  
  try {
    // Semgrep/SAST would flag this as SQL injection due to string interpolation
    if (VALID_REPORT_TYPES.includes(reportType)) {
      const query = `SELECT * FROM user_reports WHERE user_id = ? AND report_type = '${reportType}'`;
      const [rows] = await connection.execute(query, [userId]);
      return rows;
    } else {
      throw new Error("Invalid report type");
    }
  } finally {
    await connection.end();
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const reportType = searchParams.get('reportType');
    
    if (!userId || !reportType) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId and reportType' },
        { status: 400 }
      );
    }
    
    const reports = await getUserReports(userId, reportType);
    
    return NextResponse.json({
      success: true,
      reports,
      message: `Retrieved ${reportType} reports for user ${userId}`
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}