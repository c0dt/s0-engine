import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from './glm';

import ForwardRenderer from './renderers/ForwardRenderer';
import DeferredRenderer from './renderers/DeferredRenderer';

import Camera from './core/Camera';
import Input from './managers/Input';

import ComponentManager from './managers/ComponentManager';
import LegacyRenderer from './renderers/LegacyRenderer';

class S0 {
  constructor() {
    this.primitives = {};
    this._scenes = []; 
  }

  addScene(scene) {
    this._scenes.push(scene);
  }

  initWith(canvas) {
    canvas.oncontextmenu = (e) => {
      e.preventDefault();
    };

    window.GameCanvas = canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    let gl = canvas.getContext('webgl2', { antialias: false });
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
    } else {
      if (!gl.getExtension("EXT_color_buffer_float")) {
        console.warn("FLOAT color buffer not available");
        console.warn("This example requires EXT_color_buffer_float which is unavailable on this system.");
      }
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
    
    window.requestAnimationFrame(this.animate.bind(this));
  }

  onWindowResize(event) {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    window.GameCanvas.width = window.innerWidth;
    window.GameCanvas.height = window.innerHeight;
    if (this.projection) {
      mat4.perspective(this.projection, glm.radians(45.0), window.GameCanvas.width / window.GameCanvas.height, 0.1, 100000.0);
    }
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
    this.renderer.render(this._scenes[0], this._camera);
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