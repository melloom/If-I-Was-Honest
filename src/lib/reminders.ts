// Reminder utilities for client-side prompts
type ReminderFrequency = 'none' | 'daily' | 'weekly'

const REMINDER_KEY = 'ifiwh-last-reminder'
const REMINDER_DISMISSED_KEY = 'ifiwh-reminder-dismissed'

export function shouldShowReminder(frequency: ReminderFrequency): boolean {
  if (frequency === 'none') return false

  const lastReminder = localStorage.getItem(REMINDER_KEY)
  const dismissed = localStorage.getItem(REMINDER_DISMISSED_KEY)

  // Don't show if dismissed today
  if (dismissed) {
    const dismissedDate = new Date(dismissed)
    const today = new Date()
    if (dismissedDate.toDateString() === today.toDateString()) {
      return false
    }
  }

  if (!lastReminder) return true

  const lastDate = new Date(lastReminder)
  const now = new Date()
  const hoursSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60)

  if (frequency === 'daily') {
    return hoursSince >= 24
  } else if (frequency === 'weekly') {
    return hoursSince >= 24 * 7
  }

  return false
}

export function markReminderShown(): void {
  localStorage.setItem(REMINDER_KEY, new Date().toISOString())
}

export function dismissReminderForToday(): void {
  localStorage.setItem(REMINDER_DISMISSED_KEY, new Date().toISOString())
}

export function clearReminderDismissal(): void {
  localStorage.removeItem(REMINDER_DISMISSED_KEY)
}
