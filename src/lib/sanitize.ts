/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses a whitelist approach - only allows safe tags and attributes
 */
export function sanitizeContent(content: string): string {
  // Remove script tags and their content
  let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '')

  // Allowed tags for rich text
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 's', 'del', 'mark',
    'blockquote', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'code', 'pre'
  ]

  // Remove all tags except allowed ones
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  sanitized = sanitized.replace(tagPattern, (match, tag) => {
    if (allowedTags.includes(tag.toLowerCase())) {
      // Remove all attributes except href for links
      if (tag.toLowerCase() === 'a') {
        const hrefMatch = match.match(/href=["']([^"']*)["']/i)
        if (hrefMatch && hrefMatch[1] && !hrefMatch[1].match(/^(https?:\/\/|\/)/)) {
          return '' // Remove links with suspicious protocols
        }
        return match.replace(/<a\b[^>]*>/gi, (aTag) => {
          const href = aTag.match(/href=["']([^"']*)["']/i)
          return href ? `<a href="${href[1]}" rel="noopener noreferrer" target="_blank">` : '<a>'
        })
      }
      // Remove all attributes from other tags
      return match.replace(/<([a-z][a-z0-9]*)\b[^>]*>/gi, '<$1>')
    }
    return '' // Remove disallowed tags
  })

  return sanitized
}

/**
 * Sanitizes plain text (removes all HTML and potentially dangerous characters)
 */
export function sanitizePlainText(text: string): string {
  // Remove all HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '')

  // Decode HTML entities
  sanitized = sanitized
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")

  // Remove any remaining suspicious patterns
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')

  return sanitized.trim()
}

// Anonymize likely PII before public display
export function anonymizeForFeed(text: string): string {
  const clean = sanitizePlainText(text)

  // Mask emails
  const withoutEmails = clean.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '[email hidden]')

  // Mask phone numbers (basic international and US patterns)
  const withoutPhones = withoutEmails.replace(/(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/g, '[phone hidden]')

  // Mask @handles (e.g., social usernames) when they look like @name
  const withoutHandles = withoutPhones.replace(/(^|\s)@([A-Za-z0-9_]{3,30})/g, '$1@[handle hidden]')

  return withoutHandles.trim()
}

/**
 * Escapes HTML entities in a string
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Validates and sanitizes URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Prevents timing attacks by using constant-time comparison
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
