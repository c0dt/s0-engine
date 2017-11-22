import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from './glm';
import * as MinimalGLTFLoader from 'minimal-gltf-loader';
import BoundingBox from './primitives/BoundingBox';

import Camera from './Camera';

export default class Main {
  constructor() {
    window.datGUI = new dat.GUI();
    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    let canvas = document.createElement('canvas');
    // canvas.width = Math.min(window.innerWidth, window.innerHeight);
    // canvas.height = canvas.width;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    let gl = canvas.getContext('webgl2', { antialias: true });
    let isWebGL2 = !!gl;
    if (!isWebGL2) {
      document.getElementById('info').innerHTML = 'WebGL 2 is not available.  See <a href="https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">How to get a WebGL 2 implementation</a>';
      return;
    }

    window.gl = gl;

    canvas.oncontextmenu = function(e) {
      e.preventDefault();
    };

    let url = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Monster/glTF/Monster.gltf';
    let glTFLoader = new MinimalGLTFLoader.glTFLoader();
    glTFLoader.loadGLTF(url, function(glTF){
      console.log(glTF);
      let i = 0;
      let len = 0;
      for (i = 0, len = glTF.bufferViews.length; i < len; i++) {
        let bufferView = glTF.bufferViews[i];
        console.log(bufferView);
        bufferView.createBuffer(gl);
        bufferView.bindData(gl);
      }
    });
    this.projection = mat4.create();
    mat4.perspective(this.projection, glm.radians(45.0), canvas.width / canvas.height, 0.1, 100000.0);
    this.camera = new Camera(vec3.fromValues(0, 0, 10));
    this.bbox = new BoundingBox;
  

    window.requestAnimationFrame(this.animate.bind(this));
  }

  _initPhysics(){
  }

  onWindowResize(event) {
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.uniforms.resolution.value.x = this.renderer.domElement.width;
    // this.uniforms.resolution.value.y = this.renderer.domElement.height;
  }
  animate(time) {
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.update(time);
    // this.uniforms.time.value += 0.05;
  }

  render() {
    this.bbox.draw(this.camera.view, this.projection);
  }

  update(time){
    // if (this.lastTime !== undefined){
    //   let dt = (dt - this.lastTime) / 1000;
    //   this.world.step(this.fixedTimeStep, dt, this.maxSubSteps);
    // }
  }
}

Promise.all([
  FBInstant.initializeAsync().then((r) => {
    return Promise.resolve();
  })
]).then(() => {
  window.mainApp = new Main();
  return new Promise((resolve, inject) => {
    // window.ServiceProxy.onReady = () => {
    resolve();
    // };
  });
}).then(() => {
  return FBInstant.startGameAsync();
});