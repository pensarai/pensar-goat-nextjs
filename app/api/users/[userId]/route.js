import { NextResponse } from 'next/server';

// Simple HTML escaping to prevent XSS in JSON strings
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Example function to get the current authenticated user's id from cookies
// Adjust as per your actual authentication/session implementation
async function getAuthenticatedUserId(request) {
  // For demonstration: look for a cookie named 'userId'
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c => {
    const trimmed = c.trim();
    const eqIdx = trimmed.indexOf('=');
    return eqIdx === -1
      ? [trimmed, '']
      : [trimmed.slice(0, eqIdx), trimmed.slice(eqIdx + 1)];
  }));
  return cookies['userId'] || null;
}

export async function GET(request, { params }) {
  const { userId } = params;

  // Get id of authenticated user
  const authUserId = await getAuthenticatedUserId(request);

  // Deny if unauthenticated, or trying to access data of other users
  if (!authUserId || authUserId !== userId) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Example user data (with XSS vectors from test)
  // All output is passed through escapeHTML to prevent XSS
  const userData = {
    id: escapeHTML(userId),
    bio: escapeHTML(`This is user ${userId}'s bio. <script>alert('xss')</script> Some text here.`),
    comments: [
      { 
        id: 1, 
        author: escapeHTML('Alice'), 
        text: escapeHTML('Great post! <script>alert("xss")</script>') 
      },
      { 
        id: 2, 
        author: escapeHTML('Bob'), 
        text: escapeHTML('Thanks for sharing <img src=x onerror=alert(1)>') 
      }
    ]
  };
  
  return NextResponse.json(userData);
}