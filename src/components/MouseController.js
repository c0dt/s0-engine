import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import Camera from '../Camera';

export default class MouseController {

  constructor() {
    this._pointers = {};

    this._handlePointerDown = this._handlePointerDown.bind(this);
    this._handlePointerMove = this._handlePointerMove.bind(this);
    this._handlePointerUp = this._handlePointerUp.bind(this);

    document.addEventListener("pointerdown", this._handlePointerDown, false);
    document.addEventListener("touchstart", this._handleTouchStart, false);
    document.addEventListener("touchmove", this._handleTouchMove, false);
  }

  _handleTouchStart(e) {
    e.preventDefault();
  }

  _handleTouchMove(e) {
    e.preventDefault();
  }

  _handlePointerDown(evt) {
    evt.preventDefault();
    document.addEventListener("pointermove", this._handlePointerMove, false);
    document.addEventListener("pointerup", this._handlePointerUp, false);
    document.addEventListener("pointerleave", this._handlePointerUp, false);

    this._pointers[evt.pointerId] = {
      startX: evt.offsetX,
      startY: evt.offsetY,
      timestamp: Date.now
    };
  }

  _handlePointerMove(evt) {
    evt.preventDefault();
    if (this._pointers[evt.pointerId]) {
      let pointer = this._pointers[evt.pointerId];
      let dX = evt.offsetX - pointer.x;
      let dY = evt.offsetY - pointer.y;
      pointer.dX = isNaN(dX) ? 0 : dX;
      pointer.dY = isNaN(dX) ? 0 : dY;
      pointer.x = evt.offsetX;
      pointer.y = evt.offsetY;
      console.log(pointer);

      // mat4.scale(this.target.worldOffset, mat4.create(), vec3.fromValues(2, 2, 2));
      mat4.rotate(this.target.worldOffset, this.target.worldOffset, Math.PI / 180 * pointer.dX, vec3.fromValues(0, 1, 0));
      mat4.rotate(this.target.worldOffset, this.target.worldOffset, Math.PI / 180 * pointer.dY, vec3.fromValues(1, 0, 0));
    }
  }

  _handlePointerUp(evt) {
    evt.preventDefault();
    document.removeEventListener("pointerup", this._handlePointerUp, false);
    document.removeEventListener("pointerleave", this._handlePointerUp, false);
    document.removeEventListener("pointermove", this._handlePointerMove, false);
  }

  start() {
      
  }

  update() {
 
  }

  handleStart(evt) {
    console.log(evt);
  }
    
}