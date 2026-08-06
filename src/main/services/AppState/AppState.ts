// Global application state
export class AppState {
  private isQuitting = false;

  public getIsQuitting(): boolean {
    return this.isQuitting;
  }

  public setIsQuitting(value: boolean): void {
    this.isQuitting = value;
  }
}
