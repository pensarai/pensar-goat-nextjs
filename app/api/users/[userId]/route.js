import { NextResponse } from 'next/server';

// Simple HTML escaping function to prevent XSS
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Dummy function representing session retrieval/auth (replace with your actual logic)
async function getAuthenticatedUserId(request) {
  // Example: Assume auth header contains userId for demonstration.
  // In production, replace this with your session/auth logic!
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  // Expected format: "Bearer userId"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

export async function GET(request, { params }) {
  const { userId } = params;

  // Authentication
  const authenticatedUserId = await getAuthenticatedUserId(request);
  if (!authenticatedUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Authorization: Only allow users to access their own data
  if (userId !== authenticatedUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userData = {
    id: userId,
    bio: escapeHtml(`This is user ${userId}'s bio. <script>alert('xss')</script> Some text here.`),
    comments: [
      { 
        id: 1, 
        author: escapeHtml('Alice'), 
        text: escapeHtml('Great post! <script>alert("xss")</script>')
      },
      { 
        id: 2, 
        author: escapeHtml('Bob'), 
        text: escapeHtml('Thanks for sharing <img src=x onerror=alert(1)>')
      }
    ]
  };
  
  return NextResponse.json(userData);
}