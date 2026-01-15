/**
 * Detects spam and gibberish content
 * Returns true if content appears to be spam/gibberish
 */
export function isSpamOrGibberish(content: string): boolean {
  const text = content.trim().toLowerCase()
  
  if (text.length < 10) return false // Too short to determine
  
  // 1. Check for excessive repeated characters (e.g., "aaaaaaa", "hahahaha")
  const repeatedCharsPattern = /(.)\1{6,}/g
  if (repeatedCharsPattern.test(text)) {
    return true
  }
  
  // 2. Check for excessive repeated patterns (e.g., "lololol", "nanana")
  const repeatedPatternsPattern = /(.{2,5})\1{4,}/g
  if (repeatedPatternsPattern.test(text)) {
    return true
  }
  
  // 3. Calculate consonant-to-vowel ratio (gibberish has unusual ratios)
  const vowels = text.match(/[aeiou]/g) || []
  const consonants = text.match(/[bcdfghjklmnpqrstvwxyz]/g) || []
  const letters = vowels.length + consonants.length
  
  if (letters > 20) {
    const vowelRatio = vowels.length / letters
    // Normal English text has ~40% vowels
    // Gibberish often has <20% or >60% vowels
    if (vowelRatio < 0.15 || vowelRatio > 0.65) {
      return true
    }
  }
  
  // 4. Check for excessive special characters or numbers
  const specialChars = text.match(/[^a-z0-9\s.,!?'":-]/g) || []
  const specialRatio = specialChars.length / text.length
  if (specialRatio > 0.3) { // More than 30% special chars
    return true
  }
  
  // 5. Check for keyboard mashing patterns (consecutive keys on QWERTY)
  const keyboardRows = [
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm'
  ]
  
  for (const row of keyboardRows) {
    // Check for 5+ consecutive characters from same keyboard row
    for (let i = 0; i <= row.length - 5; i++) {
      const sequence = row.substring(i, i + 5)
      if (text.includes(sequence) || text.includes(sequence.split('').reverse().join(''))) {
        return true
      }
    }
  }
  
  // 6. Check for common spam phrases
  const spamPhrases = [
    'click here',
    'buy now',
    'limited time',
    'act fast',
    'free money',
    'get rich',
    'weight loss',
    'pills',
    'viagra',
    'casino',
    'lottery',
    'winner',
  ]
  
  for (const phrase of spamPhrases) {
    if (text.includes(phrase)) {
      return true
    }
  }
  
  // 7. Check for excessive URLs or email addresses
  const urlPattern = /https?:\/\/[^\s]+/g
  const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g
  const urls = text.match(urlPattern) || []
  const emails = text.match(emailPattern) || []
  
  if (urls.length > 2 || emails.length > 1) {
    return true
  }
  
  return false
}

/**
 * Calculates a spam score (0-100)
 * Higher score = more likely spam
 */
export function getSpamScore(content: string): number {
  const text = content.trim().toLowerCase()
  let score = 0
  
  // Repeated characters (+20 points)
  if (/(.)\1{6,}/.test(text)) score += 20
  
  // Repeated patterns (+20 points)
  if (/(.{2,5})\1{4,}/.test(text)) score += 20
  
  // Unusual vowel ratio (+15 points)
  const vowels = text.match(/[aeiou]/g) || []
  const consonants = text.match(/[bcdfghjklmnpqrstvwxyz]/g) || []
  const letters = vowels.length + consonants.length
  if (letters > 20) {
    const vowelRatio = vowels.length / letters
    if (vowelRatio < 0.15 || vowelRatio > 0.65) score += 15
  }
  
  // High special char ratio (+15 points)
  const specialChars = text.match(/[^a-z0-9\s.,!?'":-]/g) || []
  const specialRatio = specialChars.length / text.length
  if (specialRatio > 0.3) score += 15
  
  // Keyboard mashing (+25 points)
  const keyboardRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
  for (const row of keyboardRows) {
    for (let i = 0; i <= row.length - 5; i++) {
      const sequence = row.substring(i, i + 5)
      if (text.includes(sequence) || text.includes(sequence.split('').reverse().join(''))) {
        score += 25
        break
      }
    }
  }
  
  // Multiple URLs (+20 points)
  const urls = text.match(/https?:\/\/[^\s]+/g) || []
  if (urls.length > 2) score += 20
  
  return Math.min(score, 100)
}
