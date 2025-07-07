export class PinStorage {
  private static INSIGHTS_PIN_KEY = "family-art-therapy-insights-pin"
  private static FAILED_ATTEMPTS_KEY = "family-art-therapy-failed-attempts"
  private static LOCKOUT_TIME_KEY = "family-art-therapy-lockout-time"

  static setInsightsPin(pin: string): void {
    localStorage.setItem(this.INSIGHTS_PIN_KEY, pin)
  }

  static getInsightsPin(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.INSIGHTS_PIN_KEY)
  }

  static verifyInsightsPin(pin: string): boolean {
    const storedPin = this.getInsightsPin()
    return storedPin === pin
  }

  static getFailedAttempts(): number {
    if (typeof window === "undefined") return 0
    const attempts = localStorage.getItem(this.FAILED_ATTEMPTS_KEY)
    return attempts ? Number.parseInt(attempts, 10) : 0
  }

  static incrementFailedAttempts(): number {
    const attempts = this.getFailedAttempts() + 1
    localStorage.setItem(this.FAILED_ATTEMPTS_KEY, attempts.toString())

    if (attempts >= 3) {
      const lockoutTime = Date.now() + 5 * 60 * 1000 // 5 minutes
      localStorage.setItem(this.LOCKOUT_TIME_KEY, lockoutTime.toString())
    }

    return attempts
  }

  static resetFailedAttempts(): void {
    localStorage.removeItem(this.FAILED_ATTEMPTS_KEY)
    localStorage.removeItem(this.LOCKOUT_TIME_KEY)
  }

  static isLockedOut(): boolean {
    if (typeof window === "undefined") return false
    const lockoutTime = localStorage.getItem(this.LOCKOUT_TIME_KEY)
    if (!lockoutTime) return false

    const lockoutTimestamp = Number.parseInt(lockoutTime, 10)
    const now = Date.now()

    if (now < lockoutTimestamp) {
      return true
    } else {
      // Lockout expired, clear it
      this.resetFailedAttempts()
      return false
    }
  }

  static getRemainingLockoutTime(): number {
    if (typeof window === "undefined") return 0
    const lockoutTime = localStorage.getItem(this.LOCKOUT_TIME_KEY)
    if (!lockoutTime) return 0

    const lockoutTimestamp = Number.parseInt(lockoutTime, 10)
    const remaining = Math.max(0, lockoutTimestamp - Date.now())
    return Math.ceil(remaining / 1000) // Return seconds
  }
}
