import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from './glm';
import * as MinimalGLTFLoader from 'minimal-gltf-loader';
import BoundingBox from './primitives/BoundingBox';


import Quad from './primitives/Quad';

import Texture from './Texture';
import Shader, { ShaderStatic } from './Shader';

import FlyController from './components/FlyController';
import MouseController from './components/MouseController';

import ForwardRenderer from './renderers/ForwardRenderer';

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

    this.renderer = new ForwardRenderer(canvas.width, canvas.height);
    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    this.flyController = new FlyController;
    this.mouseController = new MouseController;

    canvas.oncontextmenu = function(e) {
      e.preventDefault();
    };
    this.primitives = {};
    // let url = 'models/YippyKawaii/Miniscene/Miniscene.gltf';
    let url = 'models/SimpleTownLite/pizza_car_seperate/pizza_car_seperate.gltf';
    let glTFLoader = new MinimalGLTFLoader.glTFLoader();
    glTFLoader.loadGLTF(url, (glTF) => {
      console.log(glTF);
      this.glTF = glTF;
      let i = 0;
      let len = 0;
      for (i = 0, len = glTF.bufferViews.length; i < len; i++) {
        let bufferView = glTF.bufferViews[i];
        bufferView.createBuffer(gl);
        bufferView.bindData(gl);
      }

      let meshes = glTF.meshes;
      for (let i = 0; i < meshes.length; i++) {
        let mesh = meshes[i];
        mesh.primitives.forEach((primitive) => {
          primitive.shader = new Shader();
          primitive.vertexArray = gl.createVertexArray();
          gl.bindVertexArray(primitive.vertexArray);
          for (let key in primitive.attributes) {
            if (primitive.attributes.hasOwnProperty(key)) {
              let location = ATTRIBUTES[key];
              if (location !== undefined) {
                console.log(`${key} at ${location}`);
                this.setupAttribuite(primitive.attributes[key], ATTRIBUTES[key]);
              }
            }
          }

          if (primitive.indices !== null) {
            let accessor = glTF.accessors[primitive.indices];
            let bufferView = accessor.bufferView;
            if (bufferView.target === null) {
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferView.buffer);
              gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bufferView.data, gl.STATIC_DRAW);
            } else {
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferView.buffer);
            }
          }
          gl.bindVertexArray(null);
          gl.bindBuffer(gl.ARRAY_BUFFER, null);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        });
      }
      this.scene = glTF.scenes[0];
      this.nodeMatrix = new Array(glTF.nodes.length);
      for (i = 0, len = this.nodeMatrix.length; i < len; i++) {
        this.nodeMatrix[i] = mat4.create();
      }
      window.requestAnimationFrame(this.animate.bind(this));
      console.timeEnd("[Init]");
    });
  }

  setupAttribuite(attrib, location) {
    if (attrib !== undefined) {
      let accessor = attrib;
      let bufferView = accessor.bufferView;
      if (bufferView.target === null) {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferView.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, bufferView.data, gl.STATIC_DRAW);
      } else {
        gl.bindBuffer(bufferView.target, bufferView.buffer);
      }
      accessor.prepareVertexAttrib(location, gl);
      return true;
    }
    return false;
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
    this.renderer.render(this.scene, this.glTF.textures);
  }

  update(time) {
    this.flyController.update();
    this.mouseController.update();
  }
}
// Promise.all([
//   FBInstant.initializeAsync().then(function(r) {
//     return Promise.resolve();
//   })
// ]).then(() => {
window.mainApp = new Main();
//   Promise.resolve();
// }).then(function() {
//   return FBInstant.startGameAsync();
// });
