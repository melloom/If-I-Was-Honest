# Data Model

## Database Overview

We recommend **PostgreSQL** for its robust support for JSON, full-text search, and row-level security. All timestamps use UTC.

---

## Schema

### Table: `users`

Primary user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | User identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email (lowercase) |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT false | Email verification status |
| `password_hash` | VARCHAR(255) | NULL | Hashed password (nullable for magic link users) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last account update |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |
| `preferences` | JSONB | NULL | User preferences (theme, notifications, etc.) |

**Indexes**:
- `idx_users_email` ON `users` (`email`) WHERE `deleted_at IS NULL`
- `idx_users_created_at` ON `users` (`created_at`)

**Example Record**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "email_verified": true,
  "password_hash": "$2b$10$...",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "deleted_at": null,
  "preferences": {
    "theme": "dark",
    "font_size": "medium",
    "auto_save": true,
    "show_character_count": false
  }
}
```

---

### Table: `entries`

Private journal entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Entry identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users.id | Owner user |
| `title` | VARCHAR(500) | NULL | Entry title (optional) |
| `content` | TEXT | NOT NULL | Entry content (rich text stored as HTML or Markdown) |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT 'still_true' | Entry status enum |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Entry creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last edit time |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |
| `published_at` | TIMESTAMP | NULL | When entry was published (NULL = private) |
| `published_entry_id` | UUID | NULL | Reference to published_entries table |
| `time_lock_until` | TIMESTAMP | NULL | Entry locked until this date (future feature) |
| `metadata` | JSONB | NULL | Additional metadata (word count, etc.) |

**Status Enum Values**:
- `still_true` - "Still true"
- `i_grew` - "I've grown"
- `i_was_coping` - "I was coping"
- `i_lied_to_myself` - "I lied to myself"

**Indexes**:
- `idx_entries_user_id` ON `entries` (`user_id`) WHERE `deleted_at IS NULL`
- `idx_entries_created_at` ON `entries` (`created_at`) WHERE `deleted_at IS NULL`
- `idx_entries_published_at` ON `entries` (`published_at`) WHERE `published_at IS NOT NULL`
- `idx_entries_status` ON `entries` (`status`) WHERE `deleted_at IS NULL`
- `idx_entries_fulltext` ON `entries` USING gin(to_tsvector('english', content || ' ' || COALESCE(title, ''))) WHERE `deleted_at IS NULL`

**Foreign Keys**:
- `fk_entries_user` → `users.id` ON DELETE CASCADE

**Example Record**:
```json
{
  "id": "223e4567-e89b-12d3-a456-426614174000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Feeling overwhelmed",
  "content": "<p>Today was really hard...</p>",
  "status": "still_true",
  "created_at": "2024-01-15T14:30:00Z",
  "updated_at": "2024-01-15T14:30:00Z",
  "deleted_at": null,
  "published_at": null,
  "published_entry_id": null,
  "time_lock_until": null,
  "metadata": {
    "word_count": 150,
    "character_count": 850
  }
}
```

---

### Table: `tags`

Mood tags and custom tags.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Tag identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users.id | Owner user (NULL for system mood tags) |
| `name` | VARCHAR(100) | NOT NULL | Tag name (lowercase, normalized) |
| `type` | VARCHAR(20) | NOT NULL | Tag type: 'mood' or 'custom' |
| `color` | VARCHAR(7) | NULL | Hex color code (for mood tags) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Tag creation time |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes**:
- `idx_tags_user_id` ON `tags` (`user_id`) WHERE `deleted_at IS NULL`
- `idx_tags_name` ON `tags` (`name`) WHERE `deleted_at IS NULL`
- `idx_tags_type` ON `tags` (`type`) WHERE `deleted_at IS NULL`
- `idx_tags_user_name` UNIQUE ON `tags` (`user_id`, `name`) WHERE `deleted_at IS NULL`

**Foreign Keys**:
- `fk_tags_user` → `users.id` ON DELETE CASCADE (nullable for system tags)

**Example Records**:
```json
// System mood tag
{
  "id": "323e4567-e89b-12d3-a456-426614174000",
  "user_id": null,
  "name": "anxious",
  "type": "mood",
  "color": "#C17A7A",
  "created_at": "2024-01-01T00:00:00Z",
  "deleted_at": null
}

// Custom tag
{
  "id": "423e4567-e89b-12d3-a456-426614174000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "work-stress",
  "type": "custom",
  "color": null,
  "created_at": "2024-01-15T10:00:00Z",
  "deleted_at": null
}
```

---

### Table: `entry_tags`

Join table for entries and tags (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `entry_id` | UUID | NOT NULL, FOREIGN KEY → entries.id | Entry identifier |
| `tag_id` | UUID | NOT NULL, FOREIGN KEY → tags.id | Tag identifier |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Association creation time |

**Indexes**:
- `idx_entry_tags_entry_id` ON `entry_tags` (`entry_id`)
- `idx_entry_tags_tag_id` ON `entry_tags` (`tag_id`)
- `idx_entry_tags_unique` UNIQUE ON `entry_tags` (`entry_id`, `tag_id`)

**Foreign Keys**:
- `fk_entry_tags_entry` → `entries.id` ON DELETE CASCADE
- `fk_entry_tags_tag` → `tags.id` ON DELETE CASCADE

**Example Record**:
```json
{
  "entry_id": "223e4567-e89b-12d3-a456-426614174000",
  "tag_id": "323e4567-e89b-12d3-a456-426614174000",
  "created_at": "2024-01-15T14:30:00Z"
}
```

---

### Table: `published_entries`

Anonymous public entries (separate from private entries for security).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Published entry identifier |
| `anonymous_id` | VARCHAR(20) | UNIQUE, NOT NULL | Public-facing ID (e.g., "honest-7k3j9x") |
| `title` | VARCHAR(500) | NULL | Entry title (sanitized) |
| `content` | TEXT | NOT NULL | Entry content (sanitized) |
| `mood_tags` | JSONB | NOT NULL | Array of mood tag names (only moods, no custom tags) |
| `published_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Publication time |
| `removed_at` | TIMESTAMP | NULL | Removal timestamp (admin action or grace period) |
| `report_count` | INTEGER | NOT NULL, DEFAULT 0 | Number of reports (for auto-hide) |
| `metadata` | JSONB | NULL | Additional metadata (word count, etc.) |

**Indexes**:
- `idx_published_entries_published_at` ON `published_entries` (`published_at`) WHERE `removed_at IS NULL`
- `idx_published_entries_anonymous_id` ON `published_entries` (`anonymous_id`)
- `idx_published_entries_mood_tags` ON `published_entries` USING gin (`mood_tags`) WHERE `removed_at IS NULL`
- `idx_published_entries_fulltext` ON `published_entries` USING gin(to_tsvector('english', content || ' ' || COALESCE(title, ''))) WHERE `removed_at IS NULL`

**Example Record**:
```json
{
  "id": "523e4567-e89b-12d3-a456-426614174000",
  "anonymous_id": "honest-7k3j9x",
  "title": "Feeling overwhelmed",
  "content": "<p>Today was really hard...</p>",
  "mood_tags": ["anxious", "overwhelmed"],
  "published_at": "2024-01-16T10:00:00Z",
  "removed_at": null,
  "report_count": 0,
  "metadata": {
    "word_count": 150
  }
}
```

---

### Table: `entry_status_history`

Optional history of status changes for reflection.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | History record identifier |
| `entry_id` | UUID | NOT NULL, FOREIGN KEY → entries.id | Entry identifier |
| `old_status` | VARCHAR(50) | NULL | Previous status (NULL for first status) |
| `new_status` | VARCHAR(50) | NOT NULL | New status |
| `changed_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Change timestamp |
| `changed_by` | UUID | NOT NULL, FOREIGN KEY → users.id | User who made change |

**Indexes**:
- `idx_entry_status_history_entry_id` ON `entry_status_history` (`entry_id`)
- `idx_entry_status_history_changed_at` ON `entry_status_history` (`changed_at`)

**Foreign Keys**:
- `fk_entry_status_history_entry` → `entries.id` ON DELETE CASCADE
- `fk_entry_status_history_user` → `users.id` ON DELETE CASCADE

**Example Record**:
```json
{
  "id": "623e4567-e89b-12d3-a456-426614174000",
  "entry_id": "223e4567-e89b-12d3-a456-426614174000",
  "old_status": "still_true",
  "new_status": "i_grew",
  "changed_at": "2024-01-20T15:00:00Z",
  "changed_by": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

### Table: `reports`

User reports of published entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Report identifier |
| `published_entry_id` | UUID | NOT NULL, FOREIGN KEY → published_entries.id | Reported entry |
| `reason` | VARCHAR(50) | NOT NULL | Report reason enum |
| `details` | TEXT | NULL | Additional details from reporter |
| `reported_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Report timestamp |
| `reviewed_at` | TIMESTAMP | NULL | Admin review timestamp |
| `reviewed_by` | UUID | NULL, FOREIGN KEY → users.id | Admin reviewer (NULL if not reviewed) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Report status: 'pending', 'resolved', 'dismissed' |
| `action_taken` | TEXT | NULL | Admin notes on action taken |

**Reason Enum Values**:
- `spam`
- `hateful`
- `self_harm`
- `illegal`
- `other`

**Indexes**:
- `idx_reports_published_entry_id` ON `reports` (`published_entry_id`)
- `idx_reports_status` ON `reports` (`status`) WHERE `status = 'pending'`
- `idx_reports_reported_at` ON `reports` (`reported_at`)

**Foreign Keys**:
- `fk_reports_published_entry` → `published_entries.id` ON DELETE CASCADE
- `fk_reports_reviewer` → `users.id` ON DELETE SET NULL

**Example Record**:
```json
{
  "id": "723e4567-e89b-12d3-a456-426614174000",
  "published_entry_id": "523e4567-e89b-12d3-a456-426614174000",
  "reason": "spam",
  "details": "This looks like promotional content",
  "reported_at": "2024-01-17T12:00:00Z",
  "reviewed_at": null,
  "reviewed_by": null,
  "status": "pending",
  "action_taken": null
}
```

---

### Table: `sessions`

User authentication sessions (if using database sessions).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Session identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users.id | User identifier |
| `token` | VARCHAR(255) | UNIQUE, NOT NULL | Session token |
| `expires_at` | TIMESTAMP | NOT NULL | Session expiration |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Session creation |
| `last_used_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last activity timestamp |
| `user_agent` | VARCHAR(500) | NULL | User agent string |
| `ip_address` | INET | NULL | IP address |

**Indexes**:
- `idx_sessions_token` ON `sessions` (`token`)
- `idx_sessions_user_id` ON `sessions` (`user_id`)
- `idx_sessions_expires_at` ON `sessions` (`expires_at`)

**Foreign Keys**:
- `fk_sessions_user` → `users.id` ON DELETE CASCADE

**Example Record**:
```json
{
  "id": "823e4567-e89b-12d3-a456-426614174000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2024-02-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "last_used_at": "2024-01-15T14:30:00Z",
  "user_agent": "Mozilla/5.0...",
  "ip_address": "192.168.1.1"
}
```

---

### Table: `audit_log` (Optional)

Audit trail for security and compliance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Log entry identifier |
| `user_id` | UUID | NULL, FOREIGN KEY → users.id | User who performed action (NULL for system) |
| `action` | VARCHAR(50) | NOT NULL | Action type (e.g., 'entry_created', 'entry_published') |
| `resource_type` | VARCHAR(50) | NULL | Resource type (e.g., 'entry', 'user') |
| `resource_id` | UUID | NULL | Resource identifier |
| `metadata` | JSONB | NULL | Additional context |
| `ip_address` | INET | NULL | IP address |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Log timestamp |

**Indexes**:
- `idx_audit_log_user_id` ON `audit_log` (`user_id`)
- `idx_audit_log_action` ON `audit_log` (`action`)
- `idx_audit_log_created_at` ON `audit_log` (`created_at`)
- `idx_audit_log_resource` ON `audit_log` (`resource_type`, `resource_id`)

**Foreign Keys**:
- `fk_audit_log_user` → `users.id` ON DELETE SET NULL

**Example Record**:
```json
{
  "id": "923e4567-e89b-12d3-a456-426614174000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "action": "entry_published",
  "resource_type": "entry",
  "resource_id": "223e4567-e89b-12d3-a456-426614174000",
  "metadata": {
    "published_entry_id": "523e4567-e89b-12d3-a456-426614174000"
  },
  "ip_address": "192.168.1.1",
  "created_at": "2024-01-16T10:00:00Z"
}
```

---

## Relationships

```
users
  ├─→ entries (1:N)
  │     ├─→ entry_tags (N:M via entries)
  │     └─→ entry_status_history (1:N)
  ├─→ tags (1:N, custom tags only)
  ├─→ sessions (1:N)
  └─→ audit_log (1:N)

entries
  ├─→ entry_tags (N:M via entry_tags)
  └─→ published_entries (1:1, optional)

published_entries
  └─→ reports (1:N)

tags
  └─→ entry_tags (N:M via entry_tags)
```

---

## Database Functions & Triggers

### Auto-update `updated_at`
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Generate Anonymous ID
```sql
CREATE OR REPLACE FUNCTION generate_anonymous_id()
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN 'honest-' || LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 7));
END;
$$ LANGUAGE plpgsql;
```

### Auto-increment Report Count
```sql
CREATE OR REPLACE FUNCTION increment_report_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE published_entries
    SET report_count = report_count + 1
    WHERE id = NEW.published_entry_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_report_count_trigger
    AFTER INSERT ON reports
    FOR EACH ROW EXECUTE FUNCTION increment_report_count();
```

---

## Data Migrations

### Initial Migration
1. Create all tables
2. Create indexes
3. Create foreign keys
4. Create functions and triggers
5. Seed system mood tags

### Seed System Mood Tags
```sql
INSERT INTO tags (id, user_id, name, type, color) VALUES
  (uuid_generate_v4(), NULL, 'anxious', 'mood', '#C17A7A'),
  (uuid_generate_v4(), NULL, 'calm', 'mood', '#7A9B7A'),
  (uuid_generate_v4(), NULL, 'angry', 'mood', '#C17A7A'),
  (uuid_generate_v4(), NULL, 'sad', 'mood', '#8B8B9B'),
  (uuid_generate_v4(), NULL, 'happy', 'mood', '#7A9B7A'),
  (uuid_generate_v4(), NULL, 'grateful', 'mood', '#7A9B7A'),
  (uuid_generate_v4(), NULL, 'confused', 'mood', '#9B9B7A'),
  (uuid_generate_v4(), NULL, 'excited', 'mood', '#9B7A7A'),
  (uuid_generate_v4(), NULL, 'lonely', 'mood', '#8B8B9B'),
  (uuid_generate_v4(), NULL, 'content', 'mood', '#7A9B7A'),
  (uuid_generate_v4(), NULL, 'overwhelmed', 'mood', '#C17A7A'),
  (uuid_generate_v4(), NULL, 'peaceful', 'mood', '#7A9B7A');
```

---

## Data Export Format

When user requests data export, return JSON structure:

```json
{
  "user": {
    "id": "...",
    "email": "...",
    "created_at": "...",
    "preferences": {...}
  },
  "entries": [
    {
      "id": "...",
      "title": "...",
      "content": "...",
      "status": "...",
      "created_at": "...",
      "updated_at": "...",
      "tags": ["...", "..."],
      "status_history": [...]
    }
  ],
  "tags": [...],
  "exported_at": "..."
}
```

---

## Backup Strategy

1. **Daily automated backups** (full database dump)
2. **Point-in-time recovery** enabled (WAL archiving)
3. **Backup retention**: 30 days daily, 12 months monthly
4. **Encrypted backups** at rest
5. **Test restore** quarterly

---

## Assumptions

1. **UUIDs** for all IDs (better for privacy than sequential IDs)
2. **Soft deletes** for entries and tags (recoverable within 30 days)
3. **Hard deletes** for published entries after grace period (privacy)
4. **Full-text search** using PostgreSQL's built-in tsvector/tsquery
5. **JSONB** for flexible metadata storage
6. **UTC timestamps** everywhere, convert to user timezone in application layer

