let pressed = {};

let fix = function(e) {
  if (e.offsetX === undefined && e.offsetY === undefined) {
    let target = e.target || e.srcElement;
    let style = target.currentStyle || window.getComputedStyle(target, null);
    let borderLeftWidth = parseInt(style['borderLeftWidth'], 10);
    let borderTopWidth = parseInt(style['borderTopWidth'], 10);
    let rect = target.getBoundingClientRect();
    e.offsetX = e.clientX - borderLeftWidth - rect.left;
    e.offsetY = e.clientY - borderTopWidth - rect.top;
  }
};
  
class Input {
  initWith(document) {
    this._pointers = {};
    this._setupHandlers();
    document.addEventListener('keydown', (event) => {
      pressed[event.code] = true;
    }, false);
    document.addEventListener('keyup', (event) => {
      pressed[event.code] = false;
    }, false);

    document.addEventListener("pointerdown", this._handlePointerDown, false);
    document.addEventListener("pointermove", this._handlePointerMove, false);
    document.addEventListener("pointerup", this._handlePointerUp, false);
    document.addEventListener("pointerleave", this._handlePointerUp, false);
  }

  _setupHandlers() {
    this._handlePointerDown = this._handlePointerDown.bind(this);
    this._handlePointerMove = this._handlePointerMove.bind(this);
    this._handlePointerUp = this._handlePointerUp.bind(this);
  }

  isKeyDown(keyCode) {
    return pressed[keyCode];
  }

  _handlePointerDown(event) {
    fix(event);
    event.preventDefault();
    
    this._pointerId = event.pointerId;
    this._pointers[event.pointerId] = {
      startX: event.offsetX,
      startY: event.offsetY,
      x: event.offsetX,
      y: event.offsetY,
      dX: 0,
      dY: 0,
      timestamp: Date.now()
    };
  }

  _handlePointerMove(event) {
    fix(event);
    event.preventDefault();
    if (this._pointers[event.pointerId]) {
      let pointer = this._pointers[event.pointerId];
        
      let dX = event.offsetX - pointer.x;
      let dY = event.offsetY - pointer.y;

      pointer.dX = isNaN(dX) ? 0 : dX;
      pointer.dY = isNaN(dX) ? 0 : dY;
      pointer.x = event.offsetX;
      pointer.y = event.offsetY;
      pointer.dt = Date.now() - pointer.timestamp;
    }
  }

  _handlePointerUp(event) {
    event.preventDefault();
    delete this._pointers[event.pointerId];
  }

  get pointer() {
    return this._pointers[this._pointerId];
  }
}

const _instance = new Input;
  
export default _instance;