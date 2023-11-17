import * as THREE from 'three'

export class ScrollAnimator {
  constructor() {
    this.speed = 0
    this.clock = new THREE.Clock()
    this.lastTime = this.clock.getElapsedTime()
    this.currentTime = 0
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
      this.speed += touchDeltaY * 0.00026
    })
  }

  setupWheelEvent() {
    document.addEventListener('wheel', (event) => {
      this.speed += event.deltaY * 0.000026
    })
  }

  getSpeed() {
    return this.speed
  }

  breaking() {
    this.currentTime = this.clock.getElapsedTime()

    this.deltaTime = this.currentTime - this.lastTime

    this.lastTime = this.currentTime

    const decay = Math.pow(0.9, this.deltaTime * 60)
    this.speed *= decay

    requestAnimationFrame(() => {
      this.breaking()
    })
  }
}
