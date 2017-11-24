import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import Camera from '../Camera';

let pressed = {};

export default class FlyController{

  constructor() {
    document.addEventListener('keydown', ()=>{
      pressed[event.code] = true;
    }, false);
    document.addEventListener('keyup', ()=>{
      pressed[event.code] = false;
    }, false);
  }

  start() {
      
  }

  update() {
    if (pressed["KeyW"]){
      vec3.add(Camera.current._position, Camera.current._position, Camera.current.front);  
    } else if (pressed["KeyS"]){
      let front = vec3.create();
      vec3.scale(front, Camera.current.front, -1);
      vec3.add(Camera.current._position, Camera.current._position, front);  
    }

    if (pressed["KeyA"] || pressed['ArrowLeft']){
      Camera.current.yaw -= 1;
      Camera.current.updateVectors();

    } else if (pressed["KeyD"] || pressed['ArrowRight']){
      Camera.current.yaw += 1;
      Camera.current.updateVectors();
    }

    if (pressed["KeyI"]){
      let front = vec3.create();
      vec3.scale(front, Camera.current.up, 1);
      vec3.add(Camera.current._position, Camera.current._position, front);  
    } else if (pressed["KeyK"]){
      let front = vec3.create();
      vec3.scale(front, Camera.current.up, -1);
      vec3.add(Camera.current._position, Camera.current._position, front);  
    }

    if (pressed["KeyJ"]){
      let front = vec3.create();
      vec3.scale(front, Camera.current.right, -1);
      vec3.add(Camera.current._position, Camera.current._position, front);  
    } else if (pressed["KeyL"]){
      let front = vec3.create();
      vec3.scale(front, Camera.current.right, 1);
      vec3.add(Camera.current._position, Camera.current._position, front);  
    }

    if (pressed['ArrowUp']){
      Camera.current.pitch += 1;
      Camera.current.updateVectors();
    } else if (pressed['ArrowDown']) {
      Camera.current.pitch -= 1;
      Camera.current.updateVectors();
    }

  }
    
}