// Legacy NextAuth session helpers removed. Use Firebase ID token verification on the server.
export async function getCurrentUser() {
  return null
}

export async function requireAuth() {
  throw new Error('Unauthorized')
}
