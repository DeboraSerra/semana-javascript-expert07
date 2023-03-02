import { prepareRunChecker } from "../../../../shared/util.js"

const { shouldRun: scrollShouldRun } = prepareRunChecker({ timeDelay: 200 })
const { shouldRun: clickShouldRun } = prepareRunChecker({ timeDelay: 300 })

export default class HandGestureController {
  #view
  #service
  #camera
  #lastDirection = {
    direction: ``,
    y: 0,
  }
  constructor({ view, service, camera }) {
    this.#view = view
    this.#service = service
    this.#camera = camera
  }

  async init() {
    return this.#loop()
  }

  #scrollPage(direction) {
    const pxPerScroll = 100
    if (this.#lastDirection.direction === direction) {
      this.#lastDirection.y = (direction === `scroll_down`) ? (this.#lastDirection.y + pxPerScroll) : (this.#lastDirection.y - pxPerScroll)
    } else {
      this.#lastDirection.direction = direction
    }
    this.#view.scrollPage(this.#lastDirection.y)
  }

  async #estimateHands() {
    try {
      const hands = await this.#service.estimateHands(this.#camera.video)
      this.#view.clearCanvas()
      if (hands?.length) this.#view.drawResults(hands)
      for await (const { event, x, y } of this.#service.detectGestures(hands)) {
        if (event === `click`) {
          if (!clickShouldRun()) continue;
          this.#view.clickOnElement(x, y);
          continue
        }
        if (event.includes(`scroll`)) {
          if(!scrollShouldRun()) continue;
          this.#scrollPage(event)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  async #loop() {
    await this.#service.initializeDetector();
    this.#estimateHands()
    this.#view.loop(this.#loop.bind(this))
  }

  static async initialize(deps) {
    const controller = new HandGestureController(deps)
    return controller.init()
  }
}