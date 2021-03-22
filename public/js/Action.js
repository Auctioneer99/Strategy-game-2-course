class Action {
  constructor(params, callback) {
    this.params = params;
    this.callback = callback;
  }
}
class ActionQueue {
  constructor() {
    this.queue = [];
    this.isPlaying = false;
  }
  addAction(action) {
    this.queue.push(action);
    this.playNext();
  } //Добавить анимацию;
  playNext() {
    if (!this.isPlaying) {
      this.playAction();
    }
  } //Запуск анмации;
  playAction() {
    this.isPlaying = true;
    let temp = this.queue[0];

    setTimeout(() => {
      temp.callback(temp.params);
      myQueue.actionEnded();
    }, 300);
  } //Изменения объекта;
  actionEnded() {
    this.isPlaying = false;
    this.queue.splice(0, 1);
    if (this.queue.length > 0) this.playNext();
    else playground.createMoves(playground.currentUnit);
    updateNamePos();
  } //Конец анимации;
}
