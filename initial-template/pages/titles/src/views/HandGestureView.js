export default class HandGestureView {
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