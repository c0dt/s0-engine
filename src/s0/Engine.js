import WebGPURenderContext from './core/contexts/WebGPURenderContext';
import WebGL1RenderContext from './core/contexts/WebGL1RenderContext';
import WebGL2RenderContext from './core/contexts/WebGL2RenderContext';
import CanvasRenderContext from './core/contexts/CanvasRenderContext';

import ForwardRenderer from './renderers/ForwardRenderer';

import ProgramManager from '../managers/ProgramManager';

////////////////////////////////////////////////////////////
import TestCube from './primitives/TestCube';
import { mat4, vec3 } from 'gl-matrix';
import { glm } from '../glm';
import Camera from '../core/Camera';

class Engine {
  constructor() {
    this._contexts = [
      WebGPURenderContext,
      WebGL2RenderContext,
      WebGL1RenderContext,
      CanvasRenderContext
    ];
  }

  initWith(canvas) {
    this._canvas = canvas;
    this._canvas.oncontextmenu = (e) => {
      e.preventDefault();
    };
    let width = this._canvas.width = window.innerWidth;
    let height = this._canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    let context = this._initGLContext(canvas);
    this._initManagers(context);
    this._context = context;
    this._onWindowResize();
    window.addEventListener('resize', this._onWindowResize.bind(this), false);

    this._renderer = new ForwardRenderer();
    this._renderer.setSize(context, width, height);

    let projection = mat4.create();
    mat4.perspective(projection, glm.radians(45.0), this._canvas.width / this._canvas.height, 0.1, 100000.0);
    this._camera = new Camera(projection, {
      position: vec3.fromValues(0, 1, 10),
      yaw: -90.0,
      pitch: 0
    });
    
    let M = mat4.create();
    mat4.rotateX(M, M, Math.PI / 10);
    mat4.rotateY(M, M, Math.PI / 4);
    let MV = mat4.mul(mat4.create(), this._camera.view, M);
    let MVP1 = mat4.mul(mat4.create(), projection, MV);
    M = mat4.create();
    mat4.rotateX(M, M, Math.PI / 10);
    mat4.rotateY(M, M, Math.PI / 4);
    mat4.translate(M, M, vec3.fromValues(0, 3, 0));
    MV = mat4.mul(mat4.create(), this._camera.view, M);
    let MVP2 = mat4.mul(mat4.create(), projection, MV);
    M = mat4.create();
    mat4.rotateX(M, M, Math.PI / 10);
    mat4.rotateY(M, M, Math.PI / 4);
    mat4.translate(M, M, vec3.fromValues(0, 3, 3));
    MV = mat4.mul(mat4.create(), this._camera.view, M);
    let MVP3 = mat4.mul(mat4.create(), projection, MV);

    let cube = new TestCube;
    let cubeGLPrimitive = this._context.prepare(cube);
    this._renderer._worldMatrices = [
      MVP1,
      MVP2,
      MVP3
    ];
    this._renderer._primitives = [
      cubeGLPrimitive,
      cubeGLPrimitive,
      cubeGLPrimitive
    ];
  }

  _initGLContext(canvas) {
    for (let i = 0; i < this._contexts.length; i++) {
      let contextDef = this._contexts[i];
      let context = contextDef.init(canvas);
      if (context) {
        return context;
      }
    }
  }

  _initManagers(context) {
    this._programManager = new ProgramManager(context);
  }

  _onWindowResize(event) {
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
    // if (this.projection) {
    //   mat4.perspective(this.projection, glm.radians(45.0), window.GameCanvas.width / window.GameCanvas.height, 0.1, 100000.0);
    // }
  }

  _nextFrame(time) {
    let dt = time - this._time;
    this._time = time;
    
    this._renderFrame();
    this._update(dt);

    window.requestAnimationFrame(this._nextFrameCallBack);
  }

  _renderFrame() {
    let cameras = [0];
    this._renderer.render(this._context, cameras);
  }

  _update(dt) {
    
  }

  preload() {

  }

  //////////////////////////////////////////////////////////////////
  start() {
    this._nextFrameCallBack = (dt) => this._nextFrame(dt);
    window.requestAnimationFrame(this._nextFrameCallBack);
  }

  //////////////////////////////////////////////////////////////////
  get programs() {
    return this._programManager;
  }
}

const _instance = new Engine;

export default _instance;