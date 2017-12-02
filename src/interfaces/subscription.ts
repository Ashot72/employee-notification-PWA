
export interface ISubscription {
  endpoint: string,
  keys: {
      auth: string,
      p256dh: string
  }
}
