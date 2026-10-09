import { NetworkStat } from '../types';

class PrivacyAuditor {
  private bytesUploaded = 0;
  private bytesDownloaded = 0;
  private localOperationsCount = 0;
  private listeners: ((stat: NetworkStat) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.notify());
      window.addEventListener('offline', () => this.notify());
    }
  }

  public recordLocalOperation(): void {
    this.localOperationsCount++;
    this.notify();
  }

  public getStat(): NetworkStat {
    return {
      bytesUploaded: this.bytesUploaded,
      bytesDownloaded: this.bytesDownloaded,
      isFullyOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      localOperationsCount: this.localOperationsCount,
    };
  }

  public subscribe(listener: (stat: NetworkStat) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStat());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const stat = this.getStat();
    this.listeners.forEach((l) => l(stat));
  }
}

export const privacyAuditor = new PrivacyAuditor();
