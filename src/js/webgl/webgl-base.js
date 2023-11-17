import { gsap } from 'gsap'
// import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane'
import fragmentShader from './shader/fragment.glsl'
import vertexShader from './shader/vertex.glsl'

export function init() {
  const sketch = new Sketch({
    dom: document.getElementById('webgl-canvas'),
  })
}
export class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene()
    this.container = options.dom

    this.devicePixelRatio = window.devicePixelRatio || 1

    this.width = this.container.offsetWidth 
    this.height = this.container.offsetHeight 

    this.Xaspect = this.width / this.height
    this.Yaspect = this.height / this.width

    this.resolution = new THREE.Vector2(this.width, this.height)

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0x000000, 1)

    this.container.appendChild(this.renderer.domElement)

    this.clock = new THREE.Clock()
    this.time = 0
    this.timeDelta = 0
    this.timeScale = 1

    this.isPlaying = true

    this.texUrl = ['/textures/square.jpg', '/textures/noise.png', '/textures/metal.webp']
    this.textures = []

    this.initiate(() => {
      this.setupResize()
      this.addObjects()
      this.addCamera()
      this.addControls()
      this.addSettings()
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
    const promises = this.texUrl.map((url, i) => {
      return new Promise((resolve) => {
        // loadの第二引数は読み込み完了時に実行されるコールバック関数
        this.textures[i] = new THREE.TextureLoader().load(url, resolve)
      })
    })

    // texturesを全て読み込んだら実行される
    Promise.all(promises).then(() => {
      cb()
    })
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

    this.pane.addButton({ title: 'resetTime' }).on('click', () => {
      this.resetTime()
      this.pane.refresh()
    })

    this.pane.addBinding(this, 'timeScale', { title: 'timeScale', min: 0.01, max: 10 })

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

    // this.camera.aspect = this.width / this.height
    // this.camera.fov = 2 * (180 / Math.PI) * Math.atan(this.height / (2 * this.dist))

    // this.plane.scale.x = this.width
    // this.plane.scale.y = this.height

    this.renderer.setSize(this.width, this.height)

    this.camera.updateProjectionMatrix()
  }
  /**
   * Add the camera to the scene.
   */
  addCamera() {
    // const fov = 60
    // const fovRad = (fov / 2) * (Math.PI / 180)
    // this.dist = this.height / 2 / Math.tan(fovRad)
    // this.camera = new THREE.PerspectiveCamera(fov, this.width / this.height, 0.001, 1000)

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.001, 1000)

    this.camera.position.set(0, 0, 2)
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
        progress: {
          value: 0,
        },
        uTexture: {
          value: this.textures[0],
        },
        mouse: {
          value: new THREE.Vector2(0, 0),
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)

    this.plane = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.plane)
  }
  /**
   * Stop the rendering loop.
   */
  stop() {
    this.isPlaying = false
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
  /**
   * Render the scene.
   */
  render() {
    if (!this.isPlaying) {
      return
    }
    const timeDelta = this.clock.getDelta() * this.timeScale

    this.time += timeDelta

    this.plane.rotation.y = this.time / 2

    this.material.uniforms.uTime.value = this.time

    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame(() => {
      this.render()
    })
  }
}
