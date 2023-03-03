export default class HandGestureView {
  #canvas = document.querySelector(`#hands`)
  #canvasContext = this.#canvas.getContext(`2d`)
  #handFingesIndexes

  constructor({ handFingesIndexes }) {
    this.#handFingesIndexes = handFingesIndexes
    this.#canvas.width = globalThis.screen.availWidth
    this.#canvas.height = globalThis.screen.availHeight
  }

  clearCanvas() {
    this.#canvasContext.clearRect(0,0, this.#canvas.width, this.#canvas.height)
  }

  drawResults(hands) {
    for (const { keypoints } of hands) {
      if (!keypoints) continue

      this.#canvasContext.fillStyle = `red`
      this.#canvasContext.strokeStyle = `white`
      this.#canvasContext.lineWidth = 8
      this.#canvasContext.lineJoin = `round`

      this.#drawJoints(keypoints)
      this.#drawFingersAndHoverElements(keypoints)
    }
  }

  clickOnElement(x, y) {
    const element = document.elementFromPoint(x, y);
    if (!element) return;
    const rect = element.getBoundingClientRect()
    const event = new MouseEvent(`click`, {
      cancelable: true,
      clientX: rect.left + x,
      clientY: rect.top + y,
      view: window,
      bubbles: true,
    })
    element.dispatchEvent(event)
  }

  #drawJoints(keypoints) {
    for (const { x, y } of keypoints) {
      this.#canvasContext.beginPath()
      const newX = x - 2
      const newY = y - 2
      const radius = 3
      const startAngle = 0
      const endAngle = 2 * Math.PI

      this.#canvasContext.arc(newX, newY, radius, startAngle, endAngle)
      this.#canvasContext.fill()
    }
  }

  #drawFingersAndHoverElements(keypoints) {
    const fingers = Object.keys(this.#handFingesIndexes)
    for (const finger of fingers) {
      const points = this.#handFingesIndexes[finger].map(index => (
        keypoints[index]
      ))
      const region = new Path2D()
      const [{x, y}] = points
      region.moveTo(x, y)
      for (const point of points) {
        region.lineTo(point.x, point.y)
      }
      this.#canvasContext.stroke(region)
    } 
  }

  async loop(fn) {
    requestAnimationFrame(fn)
  }

  scrollPage(top) {
    scroll({
      top,
      behavior: `smooth`,
    })
  }
}