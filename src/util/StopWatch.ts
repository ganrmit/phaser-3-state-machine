export default class StopWatch {
  startTime: number
  constructor() {
    this.startTime = Date.now()
  }

  elapsedMs() {
    return Date.now() - this.startTime
  }
}
