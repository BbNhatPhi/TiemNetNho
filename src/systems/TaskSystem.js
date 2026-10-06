export default class TaskSystem {
  constructor(scene) {
    this.scene = scene;
    this.activeTasks = [];
    this.taskUI = this.scene.add.container(0, 0).setDepth(250);
    this.taskBars = new Map(); // Map task to its UI elements
  }

  addTask(task, x, y) {
    this.activeTasks.push(task);
    task.start();
    
    // Create UI progress bar
    const bg = this.scene.add.rectangle(x, y, 60, 10, 0x000000, 0.8).setOrigin(0.5);
    const bar = this.scene.add.rectangle(x - 28, y, 0, 6, 0x00ffcc).setOrigin(0, 0.5);
    this.taskUI.add([bg, bar]);
    this.taskBars.set(task, { bg, bar, x, y });
  }

  update(delta) {
    for (let i = this.activeTasks.length - 1; i >= 0; i--) {
      let task = this.activeTasks[i];
      task.update(delta);
      
      let ui = this.taskBars.get(task);
      if (ui) {
        let pct = Math.min(task.progress / task.duration, 1);
        ui.bar.width = 56 * pct;
      }

      if (task.isCompleted || task.isFailed) {
        // Cleanup UI
        if (ui) {
          ui.bg.destroy();
          ui.bar.destroy();
          this.taskBars.delete(task);
        }
        this.activeTasks.splice(i, 1);
      }
    }
  }
}
