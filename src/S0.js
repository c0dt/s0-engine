import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from './glm';
import FlyController from './components/FlyController';
import MouseController from './components/MouseController';
import ForwardRenderer from './renderers/ForwardRenderer';
import DeferredRenderer from './renderers/DeferredRenderer';
import ResoucePipeline from './resources/ResourcePipeline';

import Camera from './Camera';

class S0 {
  constructor() {
        
  }

  initWith(canvas) {
    canvas.oncontextmenu = (e) => {
      e.preventDefault();
    };

    window.GameCanvas = canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    let gl = canvas.getContext('webgl2', { antialias: true });
    let isWebGL2 = !!gl;
    if (!isWebGL2) {
      console.warn('WebGL 2 is not available.  See https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation How to get a WebGL 2 implementation');
    }
    if (!gl.getExtension("EXT_color_buffer_float")) {
      console.warn("FLOAT color buffer not available");
      console.warn("This example requires EXT_color_buffer_float which is unavailable on this system.");
    }
    window.gl = gl;
    this.renderer = new ForwardRenderer(canvas.width, canvas.height);
    // this.renderer = new DeferredRenderer(canvas.width, canvas.height);
    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    //
    this.flyController = new FlyController;
    this.mouseController = new MouseController;

    this.projection = mat4.create();
    mat4.perspective(this.projection, glm.radians(45.0), canvas.width / canvas.height, 0.1, 100000.0);

    this._camera = new Camera(this.projection, {
      position: vec3.fromValues(0, 1, 5),
      yaw: -90.0,
      pitch: 0
    });
    // this.axis = new Axis;

    this.primitives = {};
    this._scenes = [];
    let urls = [
      // 'SimpleTownLite/models/apartment_large_thin_short',
      // 'SimpleTownLite/models/billboard_mesh',
      // 'SimpleTownLite/models/bin_mesh',
      // 'SimpleTownLite/models/dumpster_mesh',
      // 'SimpleTownLite/models/hotdog_truck_seperate',
      // 'SimpleTownLite/models/pizza_car_seperate',
      // 'SimpleTownLite/models/pizza_shop',
      // 'SimpleTownLite/models/road_square_mesh',
      // 'SimpleTownLite/models/road_straight_clear_mesh',
      // 'SimpleTownLite/models/road_straight_mesh',
      // 'SimpleTownLite/models/store_small_mesh',
      'Ganfaul',
      // 'ElvenRuins'
      // 'Miniscene'
    ];
    urls.forEach((url) => {
      ResoucePipeline.loadAsync(`${url}/model.gltf`, {}).then(
        (asset) => {
          this._scenes.push(asset);
          this.mouseController.target = asset.root;
          console.log(asset);
          return asset;
        }
      );
    });

    window.requestAnimationFrame(this.animate.bind(this));
  }

  onWindowResize(event) {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate(time) {
    let delta = time - this._time;
    this._time = time;
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.update(delta / 1000.0);
  }

  render() {
    this.renderer.render(this._scenes, this._camera);
  }

  update(dt) {
    this.flyController.update(dt);
    this.mouseController.update(dt);
  }
}

const _instance = new S0;

export default _instance;