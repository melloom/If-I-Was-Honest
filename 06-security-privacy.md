# Security & Privacy

## Core Principles

1. **Privacy by Design**: Private-first architecture, minimal data collection
2. **Security First**: Encryption at rest and in transit, secure authentication
3. **User Control**: Users own their data, can export/delete anytime
4. **Transparency**: Clear privacy policy, no hidden data collection
5. **Abuse Prevention**: Proactive moderation, user reporting, admin oversight

---

## Default Privacy Rules

### Private Entries

- **Access**: Only the user who created the entry
- **Visibility**: Never visible to other users or admins (unless encrypted, admins can't read content)
- **Storage**: Encrypted at rest in database
- **Backup**: Included in backups but encrypted
- **Deletion**: User can delete immediately (soft delete, recoverable for 30 days)

### Published Entries

- **Access**: Public, anonymous, no authentication required
- **Anonymity**: Complete separation from user account
  - No link back to original entry
  - No username, email, or identifying info
  - Random anonymous ID (e.g., "honest-7k3j9x")
- **Storage**: Separate `published_entries` table (no foreign key to users)
- **Content**: Sanitized HTML (no script tags, no tracking)
- **Deletion**: 
  - Grace period: User can unpublish within 24 hours
  - After grace period: Only admins can remove (via reports)
  - User cannot delete their own published entry after grace period

### User Data

- **Email**: Used only for authentication and essential notifications (opt-in)
- **Password**: Hashed with bcrypt (never stored in plaintext)
- **Preferences**: Stored in user record (theme, notifications, etc.)
- **Metadata**: 
  - Entry count (for display)
  - Last login time (for security)
  - IP address (for rate limiting, not stored long-term)
- **Never Shared**: Email, password, IP address, or preferences with third parties

### Analytics (If Any)

- **Privacy-Focused**: No personal tracking
- **Aggregated Only**: Total entries, total users (no personal data)
- **No Third-Party**: Self-hosted analytics only (or no analytics)
- **Opt-Out**: User can disable in settings

---

## Row-Level Access Control Strategy

### Database-Level (PostgreSQL RLS)

```sql
-- Enable RLS on entries table
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own entries
CREATE POLICY entries_user_policy ON entries
  FOR ALL
  TO authenticated_user
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Policy: Users can only update their own entries
CREATE POLICY entries_update_policy ON entries
  FOR UPDATE
  TO authenticated_user
  USING (user_id = current_setting('app.current_user_id')::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);

-- Policy: Users can only delete their own entries
CREATE POLICY entries_delete_policy ON entries
  FOR DELETE
  TO authenticated_user
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

### Application-Level

**Middleware**:
1. Extract user ID from JWT token
2. Verify token is valid and not expired
3. Set `app.current_user_id` in database session
4. Attach user to request object

**Authorization Checks**:
```typescript
// Example: Check ownership before returning entry
async function getEntry(entryId: string, userId: string) {
  const entry = await db.entries.findOne({
    where: { id: entryId, user_id: userId }
  });
  
  if (!entry) {
    throw new NotFoundError('Entry not found');
  }
  
  return entry;
}
```

**Published Entries**:
- No authentication required
- No user association (anonymous)
- Read-only access (no update/delete for users)

---

## Public vs Private Data

### Private Data (Never Public)

- User email
- User password (hashed)
- User preferences
- Private entry content
- Entry tags (custom tags)
- Entry status
- Entry timestamps (created_at, updated_at)
- User associations (entry ownership)

### Public Data (Published Entries Only)

- Entry content (sanitized HTML)
- Entry title (sanitized)
- Mood tags (only moods, no custom tags)
- Published timestamp (relative: "2 days ago")
- Anonymous ID (e.g., "honest-7k3j9x")

### Never Public

- User account information
- Private entry metadata
- Custom tags
- Entry status
- Search/filter history
- Report details (admin only)

---

## Abuse Prevention

### Rate Limiting

**Per User**:
- Entry creation: 10 per minute
- Publishing: 5 per hour
- Search: 100 per minute
- General API: 100 per minute

**Per IP** (Public Endpoints):
- Feed access: 100 per minute
- Report submission: 10 per hour
- Authentication: 5 per minute

**Implementation**:
- Redis-based rate limiting
- Sliding window algorithm
- Clear error messages with retry-after header

### Content Moderation

**Automated Checks**:
1. **Spam Detection**:
   - URL density check (too many URLs = spam)
   - Repeated content detection
   - Blocked words list (configurable)
2. **Harmful Content**:
   - Self-harm keywords (trigger review, don't auto-block)
   - Hate speech detection (basic keyword filtering)
3. **Length Limits**:
   - Minimum: 10 characters
   - Maximum: 10,000 characters (warn but allow)
4. **HTML Sanitization**:
   - Strip script tags, iframes, event handlers
   - Allow only safe tags: `<p>`, `<b>`, `<i>`, `<h1>`, `<h2>`, `<ul>`, `<ol>`, `<li>`, `<a>`

**Manual Review**:
- Reports trigger admin review
- 3+ reports auto-hide entry pending review
- Admin dashboard for reviewing reported entries
- Admin can restore false positives

### Reporting System

**User Reporting**:
- Report button on all published entries
- Reasons: Spam, Hateful, Self-harm, Illegal, Other
- Anonymous reporting allowed (track IP to prevent abuse)
- Thank you message after report

**Admin Review**:
- Dashboard showing all pending reports
- Entry context (full content, report count, reporter details)
- Actions: Remove entry, Dismiss report, Ban anonymous ID
- Audit log of all actions

### Account Restrictions

**Suspicious Activity**:
- Multiple failed login attempts → Temporary lockout
- Spam publishing → Account review
- Repeated reports on same user's entries → Investigation
- Bot detection → CAPTCHA challenge

**Account Deletion**:
- Immediate soft delete (recoverable for 30 days)
- Hard delete after 30 days
- Published entries remain (already anonymous)
- All private data removed

---

## Client-Side Encryption (Optional)

### Privacy Vault Mode

**Description**: Premium feature that encrypts entries client-side before sending to server.

**Implementation**:
1. User sets encryption key (never sent to server)
2. Key derived from password + salt (PBKDF2, 100k iterations)
3. Entries encrypted with AES-256-GCM
4. Encrypted content stored in database (server can't read)
5. Key stored only in browser localStorage (or user's memory)

**Flow**:
```
User writes entry → Encrypt client-side → Send encrypted blob to server → Store
User reads entry → Fetch encrypted blob → Decrypt client-side → Display
```

**Key Management**:
- Key stored in localStorage (encrypted with user's master password)
- If key lost, data is unrecoverable (clear warning)
- Export includes encrypted data + instructions for decryption
- Backup key option (encrypted with separate password, stored offline)

**Limitations**:
- Full-text search doesn't work (encrypted content)
- Server-side filtering doesn't work
- All search/filter done client-side after decryption
- Larger payload sizes (encrypted blobs)

**Security Considerations**:
- Use Web Crypto API (native browser encryption)
- Never send key to server
- Clear key from memory after use
- Warn users about key loss

---

## Data Retention

### Active Users

- **Private entries**: Kept indefinitely (until user deletes)
- **Published entries**: Kept indefinitely (until removed by admin or user within grace period)
- **User accounts**: Kept until user deletes
- **Audit logs**: 1 year retention
- **Sessions**: Deleted after expiration

### Deleted Accounts

- **Soft delete**: 30 days (user can restore)
- **Hard delete**: After 30 days
  - User record deleted
  - Private entries deleted
  - Published entries remain (already anonymous)
  - Tags deleted (cascade)
  - Sessions deleted

### Backups

- **Daily backups**: 30 days retention
- **Monthly backups**: 12 months retention
- **Encrypted backups**: AES-256 encryption at rest
- **Backup deletion**: Automatically purged after retention period

---

## GDPR Compliance

### User Rights

1. **Right to Access**: User can export all data via `/settings/export-data`
2. **Right to Rectification**: User can edit their entries and preferences
3. **Right to Erasure**: User can delete account (within 24 hours)
4. **Right to Restrict Processing**: User can unpublish entries (grace period)
5. **Right to Data Portability**: Export available in JSON format
6. **Right to Object**: User can opt out of email notifications

### Data Processing

- **Lawful Basis**: User consent (explicit consent for account creation)
- **Purpose Limitation**: Data used only for app functionality
- **Data Minimization**: Collect only necessary data (email, password, preferences)
- **Storage Limitation**: Data deleted when account deleted
- **Accuracy**: User can update their data anytime

### Privacy Policy Requirements

- Clear explanation of data collection
- Purpose of data processing
- Data retention policy
- User rights and how to exercise them
- Contact information for privacy inquiries

---

## Security Best Practices

### Authentication

- **Password Hashing**: bcrypt with cost factor 12
- **Magic Links**: Cryptographically secure tokens, 10-minute expiration
- **Session Management**: JWT with 30-day expiration, refresh tokens
- **Password Reset**: Secure tokens, 1-hour expiration, one-time use
- **Email Verification**: Required before app access

### API Security

- **HTTPS Only**: TLS 1.3, redirect HTTP to HTTPS
- **CORS**: Configure for frontend domain only
- **CSRF**: Token-based CSRF protection for cookie auth
- **Input Validation**: Sanitize all inputs, validate types
- **SQL Injection**: Parameterized queries only (Prisma/ORM)
- **XSS Prevention**: Sanitize HTML output, CSP headers

### Infrastructure

- **Database**: Encrypted at rest (AES-256)
- **Backups**: Encrypted backups, stored in secure location
- **Secrets**: Environment variables, never in code
- **Access Control**: Least privilege, separate DB users for app/admin
- **Monitoring**: Log authentication failures, suspicious activity
- **Updates**: Regular security updates for dependencies

---

## Incident Response Plan

### Data Breach

1. **Detection**: Monitor for unusual activity, failed logins, data access
2. **Containment**: Disable affected accounts, revoke sessions
3. **Assessment**: Determine scope, what data accessed
4. **Notification**: Notify affected users within 72 hours (GDPR requirement)
5. **Remediation**: Reset passwords, investigate cause, patch vulnerabilities
6. **Documentation**: Log incident, lessons learned

### Abuse Response

1. **Report Received**: Admin notified via dashboard
2. **Review**: Admin reviews entry and context
3. **Action**: Remove entry, dismiss report, or ban anonymous ID
4. **Prevention**: Update automated filters if needed

---

## Assumptions

1. **Self-Hosted Infrastructure**: Full control over data storage
2. **No Third-Party Analytics**: Privacy-focused (or self-hosted)
3. **EU Users**: GDPR compliance required
4. **Minimal Data Collection**: Only email, password, preferences
5. **Transparent Privacy Policy**: Clear, accessible, updated regularly
6. **User Education**: Help users understand privacy features (encryption, export, deletion)

