# Pensar GOAT Nextjs

This project is designed for internal benchmarking of Static Application Security Testing (SAST) tools. It contains examples of both **false positives** and **real vulnerabilities** across three key security categories using Next.js 14+ App Router.

## 🎯 Purpose

Test SAST scanner accuracy by providing:
- **False Positives**: Code that scanners flag but is actually secure
- **True Positives**: Code with real vulnerabilities that should be flagged

## 📁 Project Structure

```
sast-benchmark-nextjs-app/
├── app/
│   ├── layout.js                           # Root layout
│   ├── page.js                            # Home page
│   └── api/
│       ├── auth/login/route.js            # CSRF False Positive
│       ├── admin/delete-user/route.js     # CSRF True Positive
│       ├── admin/refund/route.js          # Auth True Positive
│       ├── admin/dashboard/route.js       # Auth False Positive
│       ├── user/profile/route.js          # Auth False Positive
│       └── users/[userId]/route.js        # Dynamic route
├── components/
│   ├── UserProfile.js                     # XSS False Positives
│   └── VulnerableContent.js               # XSS True Positives
└── utils/
    └── authHelpers.js                     # Auth Examples
```

## 🔍 Test Cases

### 1. CSRF (Cross-Site Request Forgery)

#### ✅ False Positive: `/app/api/auth/login/route.js`
- **Why SAST flags it**: No explicit CSRF token validation
- **Why it's safe**: Requires `Content-Type: application/json` header
- **Reality**: Cross-origin requests cannot set custom headers, providing natural CSRF protection

#### ❌ True Positive: `/app/api/admin/delete-user/route.js`
- **Why SAST should flag it**: Administrative action without CSRF protection
- **The vulnerability**: Accepts form data that could be submitted from malicious external sites
- **Attack vector**: Malicious website could trick admin into submitting a form

### 2. Authorization Issues

#### ✅ False Positive: `getUserSensitiveData()` in `/utils/authHelpers.js`
- **Why SAST flags it**: Helper function returns sensitive data without authorization check
- **Why it's safe**: Only called from properly authorized API routes (`/app/api/user/profile/route.js`)
- **Reality**: Authorization is handled at the API boundary, not in every helper function

#### ✅ False Positive: `getAdminDashboardStats()` in `/utils/authHelpers.js`
- **Why SAST flags it**: Administrative function without explicit permission check
- **Why it's safe**: Only invoked from admin-protected contexts (`/app/api/admin/dashboard/route.js`)

#### ❌ True Positive: `processRefund()` in `/utils/authHelpers.js`
- **Why SAST should flag it**: Performs sensitive operations without authorization
- **The vulnerability**: Any code that calls this function can issue refunds
- **Used unsafely in**: `/app/api/admin/refund/route.js` (calls helper without auth check)

### 3. XSS (Cross-Site Scripting)

#### ✅ False Positive: React components in `/components/UserProfile.js`
- **Why SAST flags it**: User input rendered without explicit escaping
- **Why it's safe**: React automatically escapes all values in JSX expressions
- **Examples**:
  - `<p>{userBio}</p>` - Auto-escaped even if userBio contains `<script>` tags
  - `{comments.map(c => <div>{c.text}</div>)}` - Array rendering is safe
  - `"Search results for: {getSearchParam('query')}"` - URL parameters are escaped

#### ❌ True Positive: `RichTextDisplay` in `/components/VulnerableContent.js`
- **Why SAST should flag it**: Uses `dangerouslySetInnerHTML` without sanitization
- **The vulnerability**: Renders user content as HTML, allowing script execution
- **Attack vector**: If `content` contains `<script>alert('XSS')</script>`, it will execute

#### ❌ True Positive: `NewsletterPreview` in `/components/VulnerableContent.js`
- **Why SAST should flag it**: Direct `innerHTML` assignment
- **The vulnerability**: Bypasses React's XSS protection by using raw DOM manipulation
- **Attack vector**: Malicious HTML in `htmlContent` will execute

## 🧪 Testing Your SAST Tool

### Expected Results for Accurate SAST Scanner:

**Should NOT flag (False Positives to avoid):**
- ✅ `/app/api/auth/login/route.js` - JSON API with natural CSRF protection
- ✅ `getUserSensitiveData()` when called from authorized contexts
- ✅ `getAdminDashboardStats()` when called from admin-protected routes
- ✅ React JSX rendering like `<p>{userInput}</p>`
- ✅ React array rendering `{items.map(item => <div>{item.text}</div>)}`

**Should flag (True Positives to catch):**
- ❌ `/app/api/admin/delete-user/route.js` - Form-based admin action without CSRF
- ❌ `processRefund()` - Sensitive operation without authorization
- ❌ `/app/api/admin/refund/route.js` - Calls sensitive helper without auth
- ❌ `dangerouslySetInnerHTML` usage
- ❌ Direct `innerHTML` assignment
- ❌ `document.write()` with user content

### Benchmarking Metrics:

```
Accuracy = (True Positives + True Negatives) / Total Test Cases
Precision = True Positives / (True Positives + False Positives)  
Recall = True Positives / (True Positives + False Negatives)
```

## 🔧 App Router Specific Features

This project leverages Next.js 14+ App Router features:
- **Route Handlers**: API routes use named exports (`GET`, `POST`) in `route.js` files
- **Server Components**: Components are server-rendered by default
- **Client Components**: Interactive components marked with `'use client'`
- **Dynamic Routes**: `/app/api/users/[userId]/route.js` demonstrates parameterized endpoints
- **Middleware Support**: Built-in support for request/response objects
- **Improved Type Safety**: Better TypeScript integration with the new routing system

## 🚀 Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   ```bash
   # .env.local
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

3. **Run the application:**
   ```bash
   npm run dev
   ```

4. **Run your SAST scanner** against the codebase

5. **Compare results** with the expected outcomes above

## 📊 Evaluation Criteria

A **good SAST scanner** should:
- Understand React's auto-escaping and not flag safe JSX rendering
- Recognize JSON APIs with custom headers as CSRF-protected
- Perform data flow analysis to understand authorization context
- Flag `dangerouslySetInnerHTML` and raw DOM manipulation
- Detect unprotected sensitive operations

A **poor SAST scanner** will:
- Generate many false positives on safe React code
- Miss real vulnerabilities like unprotected admin actions
- Lack understanding of framework-specific protections
- Flag helper functions without considering call context

## 🔧 Customization

You can extend this benchmark by:
- Adding more vulnerability types (SQL injection, path traversal, etc.)
- Creating more complex data flow scenarios  
- Including framework-specific patterns for your tech stack
- Adding examples with different sanitization libraries

## ⚠️ Important Notes

- **Do not deploy this code to production** - it contains intentional vulnerabilities
- Use only for internal security tool testing
- Keep this repository private and secure
- Regularly update examples as SAST tools improve

## 📈 Tracking Improvements

Document your SAST tool's performance over time:

| Date | Tool Version | True Positives | False Positives | False Negatives | Accuracy |
|------|-------------|----------------|-----------------|-----------------|----------|
| 2025-01-01 | Tool v1.0 | 4/6 | 8/6 | 2/6 | 67% |
| 2025-02-01 | Tool v1.1 | 5/6 | 4/6 | 1/6 | 83% |

This helps track whether tool updates actually improve security detection accuracy.