import Component from './Component';
import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import Camera from '../Camera';

let pressed = {};

export default class FlyController extends Component {

  constructor() {
    super();
    
    document.addEventListener('keydown', () => {
      pressed[event.code] = true;
    }, false);
    document.addEventListener('keyup', () => {
      pressed[event.code] = false;
    }, false);

    this._speed = 1;
  }

  get speed() {
    return this._speed;
  }

  set speed(value) {
    this._speed = value;
  }

  start() {
      
  }

  update(dt) {
    if (pressed["KeyW"]) {
      let front = vec3.create();
      vec3.scale(front, Camera.current.front, this._speed * dt);
      vec3.add(Camera.current._position, Camera.current._position, front);  
    } else if (pressed["KeyS"]) {
      let front = vec3.create();
      vec3.scale(front, Camera.current.front, -this._speed * dt);
      vec3.add(Camera.current._position, Camera.current._position, front);  
    }

    if (pressed["KeyA"] || pressed['ArrowLeft']) {
      Camera.current.yaw -= 10 * dt;
      Camera.current.updateVectors();

    } else if (pressed["KeyD"] || pressed['ArrowRight']) {
      Camera.current.yaw += 10 * dt;
      Camera.current.updateVectors();
    }

    if (pressed["KeyI"]) {
      let front = vec3.create();
      vec3.scale(front, Camera.current.up, this._speed * dt);
      vec3.add(Camera.current._position, Camera.current._position, front);  
    } else if (pressed["KeyK"]) {
      let front = vec3.create();
      vec3.scale(front, Camera.current.up, -this._speed * dt);
      vec3.add(Camera.current._position, Camera.current._position, front);  
    }

    if (pressed["KeyJ"]) {
      let front = vec3.create();
      vec3.scale(front, Camera.current.right, -this._speed * dt);
      vec3.add(Camera.current._position, Camera.current._position, front);  
    } else if (pressed["KeyL"]) {
      let front = vec3.create();
      vec3.scale(front, Camera.current.right, this._speed * dt);
      vec3.add(Camera.current._position, Camera.current._position, front);  
    }

    if (pressed['ArrowUp']) {
      Camera.current.pitch += 10 * dt;
      Camera.current.updateVectors();
    } else if (pressed['ArrowDown']) {
      Camera.current.pitch -= 10 * dt;
      Camera.current.updateVectors();
    }

  }
    
}