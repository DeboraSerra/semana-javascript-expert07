import { gestureStrings, knownGestures } from "../util/gestures.js"

export default class HandGestureService {
  #fingerpose
  #gestureEstimator
  #handPoseDetection
  #handsVersion
  #detector = null
  constructor({
    fingerpose,
    handPoseDetection,
    handsVersion,
  }) {
    this.#fingerpose = fingerpose
    this.#handPoseDetection = handPoseDetection
    this.#handsVersion = handsVersion
    this.#gestureEstimator = new fingerpose.GestureEstimator(knownGestures)
  }

  async estimate(keypoints3d) {
    const predictions = await this.#gestureEstimator.estimate(this.#getLandmarksFromKeypoints(keypoints3d), 9)
    return predictions
  }

  async * detectGestures(predictions) {
    for (const hand of predictions) {
      if (!hand.keypoints3D) continue
      const { gestures } = await this.estimate(hand.keypoints3D);
      if (!gestures.length) continue
      
      const result = gestures.reduce((p, n) => (p.score > n.score) ? p : n)

      const { x, y } = hand.keypoints.find(({ name }) => name === `index_finger_tip`)

      yield { event: result.name, x, y }
      console.log('detected', gestureStrings[result.name])
    }
  }

  #getLandmarksFromKeypoints(keypoints3d) {
    return keypoints3d.map(keypoint => [keypoint.x, keypoint.y, keypoint.z])
  }

  async estimateHands(video) {
    return this.#detector.estimateHands(video, {
      flipHorizontal: true,
    })
  }

  async initializeDetector() {
    if (this.#detector) return this.#detector
    const model = this.#handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig = {
      runtime: `mediapipe`,
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${this.#handsVersion}`,
      modelType: 'lite',
      maxHands: 2,
    }
    this.#detector = await this.#handPoseDetection.createDetector(model, detectorConfig)
    return this.#detector
  }
}