// Content warning detection for sensitive topics
const SENSITIVE_TERMS = [
  'suicide', 'kill myself', 'end it all', 'self harm', 'cutting',
  'abuse', 'abusive', 'violence', 'assault', 'trauma',
  'addiction', 'overdose', 'drugs', 'alcohol',
  'depression', 'anxiety', 'panic', 'eating disorder',
  'hate myself', 'worthless', 'hopeless'
]

export function detectSensitiveContent(text: string): boolean {
  const lowerText = text.toLowerCase()
  return SENSITIVE_TERMS.some(term => lowerText.includes(term))
}

export function getSensitiveTermsMatched(text: string): string[] {
  const lowerText = text.toLowerCase()
  return SENSITIVE_TERMS.filter(term => lowerText.includes(term))
}
