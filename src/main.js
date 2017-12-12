import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from './glm';
import * as MinimalGLTFLoader from 'minimal-gltf-loader';
import BoundingBox from './primitives/BoundingBox';


import Quad from './primitives/Quad';

import FlyController from './components/FlyController';
import MouseController from './components/MouseController';

import ForwardRenderer from './renderers/ForwardRenderer';

import ResoucePipeline from './resources/ResourcePipeline';

import Camera from './Camera';

const ATTRIBUTES = {
  'POSITION': 0,
  'NORMAL': 1,
  // 'TANGENT': 2,
  'TEXCOORD_0': 2,
  // 'TEXCOORD_1': 4,
};

export default class Main {
  constructor() {
    console.time("[Init]");
    window.datGUI = new dat.GUI();
    

    let canvas = document.createElement('canvas');
    window.GameCanvas = canvas;
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

    this.renderer = new ForwardRenderer(canvas.width, canvas.height);
    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    canvas.oncontextmenu = function(e) {
      e.preventDefault();
    };
    //
    this.flyController = new FlyController;
    this.mouseController = new MouseController;

    this.projection = mat4.create();
    mat4.perspective(this.projection, glm.radians(45.0), canvas.width / canvas.height, 0.1, 100000.0);

    this._camera = new Camera(this.projection, {
      // position: vec3.fromValues(-60, 90, 90),
      position: vec3.fromValues(0, 0.1, 0.5),
      yaw: -90.0,
      // pitch: -30.0
      pitch: 0
    });

    this.primitives = {};
    let url = 'models/SimpleTownLite/pizza_car_seperate/pizza_car_seperate.gltf';
    // let url = 'animations/YippyKawaii/Anim@ATK1/Anim@ATK1.gltf';
    ResoucePipeline.loadAsync(url, {}).then(
      (asset) => {
        this._scene = asset;
        console.log(this._scene);
        window.requestAnimationFrame(this.animate.bind(this));
      }
    );
  }

  onWindowResize(event) {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate(time) {
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.update(time);
  }

  render() {
    this.renderer.render(this._scene, this._camera);
  }

  update(time) {
    this.flyController.update();
    this.mouseController.update();
  }
}

window.mainApp = new Main();
