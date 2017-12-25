import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from './glm';
import FlyController from './components/FlyController';
import MouseController from './components/MouseController';
import ForwardRenderer from './renderers/ForwardRenderer';
import DeferredRenderer from './renderers/DeferredRenderer';
import ResoucePipeline from './resources/ResourcePipeline';

import Cubemap from './core/Cubemap';

import Camera from './Camera';
import CubemapLoader from './resources/loaders/CubemapLoader';
import TextureLoader from './resources/loaders/TextureLoader';

import IBLManager from './managers/IBLManager';
import LUTManager from './managers/LUTManager';

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

    this.renderType = 'deferred';
    // this.renderType = 'forward';

    if (this.renderType === 'deferred') {
      this.renderer = new DeferredRenderer(canvas.width, canvas.height);
    } else if (this.renderType === 'forward') {
      this.renderer = new ForwardRenderer(canvas.width, canvas.height);
    }
    
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
    let loadTasks = [];
    let task = ResoucePipeline.loadAsync('IBL/default/env/cubemap.json', { loaderClass: CubemapLoader })
      .then((cubemap) => {
        IBLManager.specularEnvSampler = cubemap.texture;
        return Promise.resolve();
      });
    loadTasks.push(task);
    task = ResoucePipeline.loadAsync('IBL/default/diffuse/cubemap.json', { loaderClass: CubemapLoader })
      .then((cubemap) => {
        IBLManager.diffuseEnvSampler = cubemap.texture;
        return Promise.resolve();
      });
    loadTasks.push(task);
    task = ResoucePipeline.loadAsync('IBL/brdfLUT.png', { name: 'BRDF_LUT', loaderClass: TextureLoader })
      .then((texture) => {
        IBLManager.brdfLUT = texture.texture;
        return Promise.resolve();
      });
    loadTasks.push(task);
    task = ResoucePipeline.loadAsync('lut/clut_default_a.png', { name: 'clut_default_a', loaderClass: TextureLoader })
    .then((texture) => {
      texture.setTextureMode(0);
      LUTManager.lutTexture = texture.texture;
      return Promise.resolve();
    });
    loadTasks.push(task);
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
      // 'Ganfaul',
      // 'arissa',
      // 'ElvenRuins'
      // 'Miniscene',
      'floor'
    ];

    Promise.all(loadTasks).then(
      () => {
        urls.forEach((url) => {
          ResoucePipeline.loadAsync(`${url}/model.gltf`).then(
            (asset) => {
              this._scenes.push(asset);
              this.mouseController.target = asset.root;
              console.log(asset);
              return asset;
            }
          );
        });
      }
    );

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
    this.update(delta / 1000.0, this._time / 1000.0);
  }

  _applyAnimation(animation, t) {
    let j, lenj;
    let channel, animationSampler, node;

    for (j = 0, lenj = animation.samplers.length; j < lenj; j++) {
      animation.samplers[j].getValue(t);
    }

    for (j = 0, lenj = animation.channels.length; j < lenj; j++) {
      channel = animation.channels[j];
      animationSampler = channel.sampler;
      node = channel.target.node;

      switch (channel.target.path) {
        case 'rotation':
          node.rotation = animationSampler.currentValue;
          break;
        case 'translation':
          node.translation = animationSampler.currentValue;
          break;
        case 'scale':
          node.scale = animationSampler.currentValue;
          break;
      }
    }
  }


  render() {
    this.renderer.render(this._scenes, this._camera);
  }

  update(dt, t) {
    this._scenes.forEach((scene) => {
      if (scene.animations) {
        scene.animations.forEach((animation) => {
          this._applyAnimation(animation, t);
        });
      }
    });
    this.flyController.update(dt);
    this.mouseController.update(dt);
  }
}

const _instance = new S0;

export default _instance;