import Component from './Component';
import { vec3, mat4, /* vec4, quat, mat4 */ } from 'gl-matrix';
import Camera from '../core/Camera';
import CameraManager from '../managers/CameraManager';
import Input from '../managers/Input';

export default class CameraController extends Component {
  start() {
    
  }
  
  update(dt) {
    let pointer = Input.pointer;
    if (pointer) {
      let dX = pointer.dX;
      let dY = pointer.dY;
      if (dX || dY) {
        console.log(`(${dX}, ${dY})`);
        let length = vec3.length(Camera.current.position);
        Camera.current.position = vec3.create();
        Camera.current.yaw += Math.PI / 18 * dX;
        Camera.current.pitch += Math.PI / 18 * dY * -1;
        Camera.current.updateVectors();
        let back = vec3.scale(vec3.create(), Camera.current.front, -1);
        vec3.scale(Camera.current.position, back, length);
        Camera.current.updateVectors();
      }
    }

  }
}