/**
 * Client-side monitoring setup
 * Initialize LogRocket for session replay
 */

// LogRocket is optional - install with: npm install logrocket
let LogRocket: any = null

export async function initializeMonitoring() {
  // Try to load LogRocket if configured (graceful fail if package not installed)
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
    try {
      // Dynamic import to avoid build-time dependency
      // @ts-ignore - LogRocket is optional
      const logrocketModule = await import('logrocket')
      LogRocket = logrocketModule.default
      
      LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID, {
        console: {
          shouldAggregateConsoleErrors: true,
        },
        network: {
          requestSanitizer: (request: any) => {
            // Remove sensitive headers
            if (request.headers) {
              delete request.headers['Authorization']
              delete request.headers['Cookie']
            }
            return request
          },
          responseSanitizer: (response: any) => {
            return response
          },
        },
      })
    } catch (error) {
      console.warn('LogRocket not available. Install with: npm install logrocket')
    }
  }
}

/**
 * Capture an exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  console.error('Error:', error, context)
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[${level.toUpperCase()}]`, message)
}

/**
 * Identify user in monitoring systems
 */
export function identifyUser(userId: string, email?: string, username?: string) {
  if (LogRocket && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
    try {
      LogRocket.identify(userId, {
        email,
        username,
      })
    } catch (error) {
      console.warn('LogRocket identify failed:', error)
    }
  }
}

/**
 * Clear user identification
 */
export function clearUser() {
  if (LogRocket && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
    try {
      LogRocket.logout()
    } catch (error) {
      console.warn('LogRocket logout failed:', error)
    }
  }
}
