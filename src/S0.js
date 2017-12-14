import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from './glm';
import FlyController from './components/FlyController';
import MouseController from './components/MouseController';
import ForwardRenderer from './renderers/ForwardRenderer';
import ResoucePipeline from './resources/ResourcePipeline';

import Camera from './Camera';

class S0 {
  constructor() {
        
  }

  initWith(canvas) {
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
    // window.datGUI = new dat.GUI();

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
      position: vec3.fromValues(0, 0.1, 0.5),
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
      'SimpleTownLite/models/hotdog_truck_seperate',
      // 'SimpleTownLite/models/pizza_car_seperate',
      // 'SimpleTownLite/models/pizza_shop',
      // 'SimpleTownLite/models/road_square_mesh',
      // 'SimpleTownLite/models/road_straight_clear_mesh',
      // 'SimpleTownLite/models/road_straight_mesh',
      // 'SimpleTownLite/models/store_small_mesh',
    ];
    urls.forEach((url) => {
      ResoucePipeline.loadAsync(`${url}/model.gltf`, {}).then(
        (asset) => {
          this._scenes.push(asset);
          this.mouseController.target = asset.root;
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
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    
    this._scenes.forEach((scene) => {
      this.renderer.render(scene, this._camera);
    });
  }

  update(dt) {
    this.flyController.update(dt);
    this.mouseController.update(dt);
  }
}

const _instance = new S0;

export default _instance;