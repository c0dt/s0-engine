import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from './glm';

import ForwardRenderer from './renderers/ForwardRenderer';
import DeferredRenderer from './renderers/DeferredRenderer';
import ResoucePipeline from './resources/ResourcePipeline';

import Camera from './core/Camera';
import CubemapLoader from './resources/loaders/CubemapLoader';
import TextureLoader from './resources/loaders/TextureLoader';

import IBLManager from './managers/IBLManager';
import LUTManager from './managers/LUTManager';
import Input from './managers/Input';

import ComponentManager from './managers/ComponentManager';
import LegacyRenderer from './renderers/LegacyRenderer';
import AudioManager from './managers/AudioManager';

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
    this.isWebGL2 = !!gl;
    if (!this.isWebGL2) {
      console.warn('WebGL 2 is not available.  See https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation How to get a WebGL 2 implementation');
      gl = canvas.getContext('webgl');
      this.isWebGL = !!gl;
      if (this.isWebGL) {
        let ext;
        ext = gl.getExtension('OES_vertex_array_object');
        if (ext === null) {
          console.error('vertex array object not supported');
          return;
        }
        window.ext = ext;
      } else {
        console.warn('WebGL is not available');
      }
    }
    if (!gl.getExtension("EXT_color_buffer_float")) {
      console.warn("FLOAT color buffer not available");
      console.warn("This example requires EXT_color_buffer_float which is unavailable on this system.");
    }
    window.gl = gl;

    Input.initWith(document);

    if (this.isWebGL2) {
      // this.renderType = 'deferred';
      this.renderType = 'forward';
      if (this.renderType === 'deferred') {
        this.renderer = new DeferredRenderer(canvas.width, canvas.height);
      } else if (this.renderType === 'forward') {
        this.renderer = new ForwardRenderer(canvas.width, canvas.height);
      }
    } else {
      this.renderer = new LegacyRenderer(canvas.width, canvas.height);
    }
    
    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    //

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
      'hero/hero.gltf'
    ];
    Promise.all(loadTasks).then(
      () => {
        urls.forEach((url) => {
          ResoucePipeline.loadAsync(`${url}`).then(
            (asset) => {
              this._scenes.push(asset);
              console.log(asset);
              return asset;
            }
          );
        });
      }
    ).catch((e) => {
      console.error(e);
    });
    window.requestAnimationFrame(this.animate.bind(this));
    ResoucePipeline.loadAsync('3-31 星と僕らと.mp3').then((buffer) => {
      console.log(buffer);
      AudioManager.testPlaySound(buffer);
    });
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

    ComponentManager.update(dt);
  }
}

const _instance = new S0;

export default _instance;