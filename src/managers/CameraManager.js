class CameraManager {
  constructor() {
    this._cameras = {};
  }
  
  get(uuid) {
    return this._cameras[uuid];
  }
  
  add(camera) {
    let uuid = camera.uuid;
    this._cameras[uuid] = camera;
  }
}
const _instance = new CameraManager;

export default _instance;