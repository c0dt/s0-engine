import Component from './Component';

import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import Camera from '../core/Camera';
import CameraManager from '../managers/CameraManager';

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

export default class MouseController extends Component {

  constructor() {
    super();
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

  _handlePointerDown(e) {
    fix(e);
    e.preventDefault();
    document.addEventListener("pointermove", this._handlePointerMove, false);
    document.addEventListener("pointerup", this._handlePointerUp, false);
    document.addEventListener("pointerleave", this._handlePointerUp, false);

    this._pointers[e.pointerId] = {
      startX: e.offsetX,
      startY: e.offsetY,
      timestamp: Date.now()
    };
  }

  _handlePointerMove(e) {
    fix(e);
    e.preventDefault();
    if (this._pointers[e.pointerId]) {
      let pointer = this._pointers[e.pointerId];
        
      let dX = e.offsetX - pointer.x;
      let dY = e.offsetY - pointer.y;

      pointer.dX = isNaN(dX) ? 0 : dX;
      pointer.dY = isNaN(dX) ? 0 : dY;
      pointer.x = e.offsetX;
      pointer.y = e.offsetY;
      pointer.dt = Date.now() - pointer.timestamp;
      // console.log(pointer);

      // mat4.scale(this.target.worldOffset, mat4.create(), vec3.fromValues(2, 2, 2));
      let rotation = mat4.create();
      mat4.rotate(rotation, rotation, Math.PI / 180 * pointer.dX, vec3.fromValues(0, 1, 0));
      mat4.rotate(rotation, rotation, Math.PI / 180 * pointer.dY, vec3.fromValues(1, 0, 0));
      mat4.mul(Camera.current.view, rotation, Camera.current.view);
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