import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import Camera from '../Camera';

export default class MouseController{

  constructor() {
    this._pointers = {};

    this._handlePointerDown = this._handlePointerDown.bind(this);
    this._handlePointerMove = this._handlePointerMove.bind(this);
    this._handlePointerUp = this._handlePointerUp.bind(this);

    document.addEventListener("pointerdown", this._handlePointerDown, false);
  }

  _handlePointerDown(evt){
    console.log(evt);
    document.addEventListener("pointermove", this._handlePointerMove, false);
    document.addEventListener("pointerup", this._handlePointerUp, false);
    document.addEventListener("pointerleave", this._handlePointerUp, false);

    this._pointers[evt.pointerId] = {
      startX: evt.offsetX,
      startY: evt.offsetY,
      timestamp: Date.now
    };
  }

  _handlePointerMove(evt){
    if (this._touches[evt.pointerId]){
      let pointer = this._pointers[evt.pointerId];
      pointer.dX = evt.offsetX - pointer.x;
      pointer.dY = evt.offsetX - pointer.y;
      pointer.x = evt.offsetX;
      pointer.y = evt.offsetY;
    }
  }

  _handlePointerUp(evt){
    console.log("_handlePointerUp");
    document.removeEventListener("pointerup", this._handlePointerUp, false);
    document.removeEventListener("pointerleave", this._handlePointerUp, false);
    document.removeEventListener("pointermove", this._handlePointerMove, false);
  }

  start() {
      
  }

  update() {
 
  }

  handleStart(evt){
    console.log(evt);
  }
    
}