export default class InteractiveTask {
  constructor(scene, id, type, duration, onComplete, onFail) {
    this.scene = scene;
    this.id = id;
    this.type = type;
    this.duration = duration; // in ms
    this.progress = 0;
    this.isCompleted = false;
    this.isFailed = false;
    this.onCompleteCallback = onComplete;
    this.onFailCallback = onFail;
  }

  start() {
    this.progress = 0;
    this.isCompleted = false;
    this.isFailed = false;
  }

  update(delta) {
    if (this.isCompleted || this.isFailed) return;
    
    this.progress += delta;
    if (this.progress >= this.duration) {
      this.complete();
    }
  }

  complete() {
    this.isCompleted = true;
    if (this.onCompleteCallback) this.onCompleteCallback();
  }

  fail() {
    this.isFailed = true;
    if (this.onFailCallback) this.onFailCallback();
  }
}
