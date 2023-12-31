import { gsap } from 'gsap'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { Pane } from 'tweakpane'
import fragmentShaderCircle from './shader/fragment-circle.glsl'
import fragmentShaderPost from './shader/fragment-post.glsl'
import fragmentShader from './shader/fragment.glsl'
import vertexShaderCircle from './shader/vertex-circle.glsl'
import vertexShaderPost from './shader/vertex-post.glsl'
import vertexShader from './shader/vertex.glsl'
import { ScrollAnimator } from '@/js/utils/ScrollAnimator'

export function init() {
  new Sketch({
    dom: document.getElementById('webgl-canvas'),
  })
}
export class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene()
    this.offscreenScene = new THREE.Scene()
    this.container = options.dom
    this.renderTarget = null

    this.devicePixelRatio = window.devicePixelRatio || 1

    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.Xaspect = this.width / this.height
    this.Yaspect = this.height / this.width

    this.resolution = new THREE.Vector2(this.width, this.height)

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(this.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0x000000, 1)

    this.container.appendChild(this.renderer.domElement)

    this.speed = 0
    this.position = 0
    this.targetPos = 0
    this.updateTimer = null
    this.timerActive = false
    this.clicked = false
    this.measure = document.querySelector('.dot')

    this.clock = new THREE.Clock()
    this.time = 0
    this.timeDelta = 0
    this.timeScale = 1

    this.isPlaying = true

    this.texUrl = [
      '/cyber/cyber01.jpg',
      '/cyber/cyber02.jpg',
      '/cyber/cyber03.jpg',
      '/cyber/cyber04.jpg',
      '/cyber/cyber05.jpg',
      '/cyber/cyber06.jpg',
    ]
    this.textures = []
    this.noiseUrl = ['/textures/metal.webp', '/textures/water.jpg', '/textures/water-texture.jpg']
    this.noises = []

    this.initiate(() => {
      this.setupResize()
      this.setupRendererTarget()
      this.addObjects()
      this.addCamera()
      // this.addControls()
      // this.addSettings()
      this.setupIndicator()
      this.ScrollAnimatorInit()
      this.timerInit()
      this.clickEventInit()
      this.clickBackEventInit()
      this.focusEventInit()
      this.resize()
      this.play()
      this.render()
    })
  }

  /**
   * Load textures and execute the callback function.
   * @param {Function} cb - Callback function to execute after loading textures.
   */
  initiate(cb) {
    const promises0 = this.texUrl.map((url, i) => {
      return new Promise((resolve) => {
        this.textures[i] = new THREE.TextureLoader().load(url, resolve)
      })
    })

    const promises1 = this.noiseUrl.map((url, i) => {
      return new Promise((resolve) => {
        this.noises[i] = new THREE.TextureLoader().load(url, resolve)
      })
    })

    const promises = [...promises0, ...promises1]

    // texturesを全て読み込んだら実行される
    Promise.all(promises).then(() => {
      cb()
    })
  }

  setupRendererTarget() {
    this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
  }

  /**
   * Initialize GUI settings.
   */
  addSettings() {
    this.pane = new Pane()

    this.pane.addButton({ title: 'play' }).on('click', () => {
      this.play()
    })
    this.pane.addButton({ title: 'stop' }).on('click', () => {
      this.stop()
    })

    this.pane.addButton({ title: 'resetTimer' }).on('click', () => {
      this.resetTimer()
      this.pane.refresh()
    })

    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'd') {
        this.pane.hidden = !this.pane.hidden
      }
    })
  }
  /**
   * Set up the window resize event listener.
   */
  setupResize() {
    this.currentWidth = window.innerWidth
    this.resizeTimeout = null

    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth
        const widthDifference = Math.abs(this.currentWidth - newWidth)

        if (widthDifference <= 0.1) {
          console.log(this.currentWidth, 'リサイズなし')
          return
        }

        this.currentWidth = newWidth
        console.log(this.currentWidth, 'リサイズ検知')
        this.resize()
      }, 10)
    })
  }
  /**
   * Update Sketch dimensions and aspect ratios on window resize.
   */
  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.Xaspect = this.width / this.height
    this.Yaspect = this.height / this.width
    this.resolution = new THREE.Vector2(this.width, this.height)

    this.imageXAspect = this.textures[0].source.data.width / this.textures[0].source.data.height
    this.imageYAspect = this.textures[0].source.data.height / this.textures[0].source.data.width

    this.material.uniforms.uXaspect.value = this.Xaspect / this.imageXAspect
    this.material.uniforms.uYaspect.value = this.Yaspect / this.imageYAspect

    this.circleMaterial.uniforms.uXaspect.value = this.Xaspect / this.imageXAspect
    this.circleMaterial.uniforms.uYaspect.value = this.Yaspect / this.imageYAspect

    this.camera.aspect = this.width / this.height
    // this.camera.fov = 2 * (180 / Math.PI) * Math.atan(this.height / (2 * this.dist))

    this.plane.scale.x = this.Xaspect

    if (window.innerWidth <= 400) {
      this.circle.scale.set(0.6, 0.6, 0.6)
    } else if (window.innerWidth <= 780) {
      this.circle.scale.set(0.8, 0.8, 0.8)
    } else {
      this.circle.scale.set(1, 1, 1)
    }

    this.renderer.setSize(this.width, this.height)

    this.camera.updateProjectionMatrix()
  }
  /**
   * Add the camera to the scene.
   */
  addCamera() {
    const fov = 60
    const fovRad = (fov / 2) * (Math.PI / 180)
    this.dist = 1 / 2 / Math.tan(fovRad)
    this.camera = new THREE.PerspectiveCamera(fov, this.width / this.height, 0.001, 1000)

    this.camera.position.set(0, 0, this.dist)
  }

  /**controls
   */
  addControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  resetTime() {
    this.time = 0
    this.timeDelta = 0
    this.timeScale = 1
  }
  /**
   * Add objects to the scene.
   */
  addObjects() {
    this.material = new THREE.RawShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives:',
      },
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {
          value: 0,
        },
        uXaspect: {
          value: this.Xaspect / this.imageXAspect,
        },
        uYaspect: {
          value: this.Yaspect / this.imageYAspect,
        },
        uResolution: {
          value: this.resolution,
        },
        uProgress: {
          value: 0,
        },
        uTexture0: {
          value: this.textures[0],
        },
        uTexture1: {
          value: this.textures[1],
        },
        uNoise: {
          value: this.noises[2],
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    this.postMaterial = new THREE.RawShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives:',
      },
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {
          value: 0,
        },
        uXaspect: {
          value: this.Xaspect / this.imageXAspect,
        },
        uYaspect: {
          value: this.Yaspect / this.imageYAspect,
        },
        uResolution: {
          value: this.resolution,
        },
        uProgress: {
          value: 0,
        },
        uTexture0: {
          value: null,
        },
        uTexture1: {
          value: null,
        },
        uNoise: {
          value: this.noises[0],
        },
      },
      vertexShader: vertexShaderPost,
      fragmentShader: fragmentShaderPost,
    })

    this.circleMaterial = new THREE.RawShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives:',
      },
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {
          value: 0,
        },
        uXaspect: {
          value: this.Xaspect / this.imageXAspect,
        },
        uYaspect: {
          value: this.Yaspect / this.imageYAspect,
        },
        uProgress: {
          value: 0,
        },
        uTexture0: {
          value: this.textures[0],
        },
        uTexture1: {
          value: this.textures[1],
        },
        uResolution: {
          value: this.resolution,
        },
        uNoise: {
          value: this.noises[1],
        },
      },
      vertexShader: vertexShaderCircle,
      fragmentShader: fragmentShaderCircle,
    })

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    this.postGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)

    // this.circleGeometry = new THREE.RingGeometry(0.2, 0.5, 100, 100, 0, Math.PI * 2)
    this.circleGeometry = new THREE.PlaneGeometry(1, 1, 100, 100)

    this.plane = new THREE.Mesh(this.geometry, this.material)
    this.plane.scale.x = this.Xaspect

    this.circle = new THREE.Mesh(this.circleGeometry, this.circleMaterial)
    this.circle.position.z = 0.00001

    this.postPlane = new THREE.Mesh(this.postGeometry, this.postMaterial)

    this.offscreenScene.add(this.plane)
    this.offscreenScene.add(this.circle)

    this.scene.add(this.postPlane)
  }
  /**
   * Stop the rendering loop.
   */
  stop() {
    this.isPlaying = false
    console.log(this.isPlaying)
  }
  /**
   * Resume the rendering loop.
   */
  play() {
    if (this.isPlaying == false) {
      this.isPlaying = true
      this.render()
    }
  }

  ScrollAnimatorInit() {
    this.scrollAnimator = new ScrollAnimator()
  }

  timerInit() {
    this.timerActive = true
    this.updateTimer = setInterval(() => {
      this.targetPos = this.position + 1
      this.targetPos = Math.ceil(this.targetPos)
    }, 7000)
    window.addEventListener('wheel', () => {
      this.timerActive = false
      this.resetTimer()
    })
    window.addEventListener('touchmove', () => {
      this.timerActive = false
      this.resetTimer()
    })
  }

  resetTimer() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }

    this.updateTimer = setInterval(() => {
      this.timerActive = true
      this.targetPos = this.position + 1
    }, 7000)
  }

  clickEventInit() {
    const next = document.querySelector('.next')
    next.addEventListener('click', () => {
      if (this.clicked === false) {
        this.clicked = true
        this.targetPos = this.position + 1
        this.timerActive = false
        this.resetTimer()
        setTimeout(() => {
          this.clicked = false
        }, 1000)
      }
    })
  }

  clickBackEventInit() {
    const prev = document.querySelector('.prev')
    prev.addEventListener('click', () => {
      if (this.clicked === false) {
        this.clicked = true
        this.targetPos = this.position - 1
        this.timerActive = false
        this.resetTimer()
        setTimeout(() => {
          this.clicked = false
        }, 1000)
      }
    })
  }

  focusEventInit() {
    window.addEventListener('focus', () => {
      console.log('focus')
      this.resetTimer()
      this.position = Math.round(this.position)
      this.targetPos = this.position
      this.play()
    })

    window.addEventListener('blur', () => {
      console.log('blur')
      this.stop()
    })
  }

  setupIndicator() {
    this.indicator = document.querySelector('.indicator')

    this.indicator.innerHTML = `${Math.abs(Math.floor(this.position) % this.textures.length) + 1}/${
      this.textures.length
    }`
  }

  updateInducator(current) {
    if (this.current !== current) {
      this.current = current
      this.indicator.innerHTML = `${current + 1}/${this.textures.length}`
    }
  }

  ease(start, end, t) {
    return start + (end - start) * t
  }

  isMobile() {
    if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
      return true
    } else {
      return false
    }
  }

  /**
   * Render the scene.
   */
  render() {
    if (!this.isPlaying) {
      return
    }

    const deltaTime = this.clock.getDelta()
    const decay = Math.pow(0.97, deltaTime * 60)

    if (this.clicked || this.timerActive) {
      let t = 0.07
      t *= deltaTime * 60
      this.position = this.ease(this.position, this.targetPos, t)
    } else {
      this.speed = this.scrollAnimator.getSpeed() * decay
      this.position += this.speed
    }

    let i = Math.round(this.position)
    let dif = i - this.position

    const positionAdjust = 0.008
    this.position += Math.sign(dif) * Math.pow(Math.abs(dif), 0.25) * positionAdjust * deltaTime * 60

    if (Math.abs(dif) < 0.001) {
      this.position = i
    }

    this.measure.style.transform = `translateY(${this.position * 100}px)`

    this.material.uniforms.uProgress.value = this.position
    this.circleMaterial.uniforms.uProgress.value = this.position

    let current = Math.abs(Math.floor(this.position) % this.textures.length)
    let next = Math.abs((Math.floor(this.position) + 1) % this.textures.length)

    this.material.uniforms.uTexture0.value = this.textures[current]
    this.material.uniforms.uTexture1.value = this.textures[next]
    this.circleMaterial.uniforms.uTexture0.value = this.textures[current]
    this.circleMaterial.uniforms.uTexture1.value = this.textures[next]

    this.updateInducator(current)

    const timeDelta = this.clock.getDelta() * this.timeScale
    this.time += timeDelta
    this.material.uniforms.uTime.value = this.time
    this.circleMaterial.uniforms.uTime.value = this.time

    this.renderer.setRenderTarget(this.renderTarget)
    this.renderer.render(this.offscreenScene, this.camera)
    this.renderer.setRenderTarget(null)

    this.postMaterial.uniforms.uTexture0.value = this.renderTarget.texture

    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame(() => {
      this.render()
    })
  }
}
