import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from '../glm';
import glMatrixVec3Proxy from '../helpers/glMatrixVec3Proxy';

export default class Camera {
  constructor(projection, { 
                position = vec3.fromValues(0.0, 0.0, 0.0), 
                up = vec3.fromValues(0.0, 1.0, 0.0), 
                yaw = -90.0, 
                pitch = 0.0, 
                roll = 0.0 
    }) {

    this._projection = projection;
    this._position = position;
    this._positionProxy = new glMatrixVec3Proxy(this._position);
    this.front = vec3.create();
    this.up = vec3.create();
    this.right = vec3.create();
    this._view = mat4.create();
    this.worldUp = up;
	// Eular Angles
    this.yaw = yaw;
    this.pitch = pitch;
    this.roll = roll;
	// Camera options
    this.movementSpeed;
    this.mouseSensitivity;
    this.zoom;

    this.updateVectors();
    
    Camera.current = this;
  }

  updateVectors() {
    vec3.normalize(this.front, vec3.fromValues(
        Math.cos(glm.radians(this.yaw)) * Math.cos(glm.radians(this.pitch)),
        Math.sin(glm.radians(this.pitch)),
        Math.sin(glm.radians(this.yaw)) * Math.cos(glm.radians(this.pitch))
    ));

    vec3.normalize(this.right, vec3.cross(vec3.create(), this.front, this.worldUp));
    vec3.normalize(this.up, vec3.cross(vec3.create(), this.right, this.front));

    let center = vec3.create();
    vec3.add(center, this._position, this.front, this.up);
    mat4.lookAt(this._view, this._position, center, this.up);
  }

  get view() {
    return this._view;
  }

  get projection() {
    return this._projection;
  }

  get position() {
    return this._position;
  }

  set position(v) {
    this._position = v;
  }
}