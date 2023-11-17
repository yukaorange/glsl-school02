export class ScrollAnimator {
  constructor() {
    this.speed = 0
    this.setupEventListeners()
    this.breaking()
  }

  setupEventListeners() {
    this.setupTouchEvents()
    this.setupWheelEvent()
  }

  setupTouchEvents() {
    let previousTouchY = 0
    window.addEventListener('touchstart', (e) => {
      previousTouchY = e.touches[0].clientY
    })
    window.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const currentTouchY = e.touches[0].clientY
      const touchDeltaY = previousTouchY - currentTouchY
      previousTouchY = currentTouchY
      this.speed += touchDeltaY * 0.00018
    })
  }
  
  setupWheelEvent() {
    document.addEventListener('wheel', (event) => {
      this.speed += event.deltaY * 0.00003
    })
  }

  getSpeed() {
    return this.speed
  }

  breaking() {
    this.speed *= 0.97
    // if (Math.abs(this.speed) < 0.00001) {
    //   this.speed = 0
    // }
    requestAnimationFrame(() => {
      this.breaking()
    })
  }
}
