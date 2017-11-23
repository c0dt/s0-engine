import { vec3, vec4, quat, mat4 } from 'gl-matrix';
import { glm } from './glm';
import * as MinimalGLTFLoader from 'minimal-gltf-loader';
import BoundingBox from './primitives/BoundingBox';
import Axis from './primitives/Axis';
import Camera from './Camera';
import Quad from './primitives/Quad';

import Texture from './Texture';
import { ShaderStatic } from './Shader';
import vs from './shaders/color.vs.glsl';
import fs from './shaders/color.fs.glsl';

const ATTRIBUTES = {
  'NORMAL': 0,
  'POSITION': 1
  // 'TANGENT': 2,
  // 'TEXCOORD_0': 3,
  // 'TEXCOORD_1': 4,
};

export default class Main {
  constructor() {
    console.time("MainInit");
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

    this.colorGrogram = ShaderStatic.createProgram(gl, vs, fs);
    this.uniformMvpLocation = gl.getUniformLocation(this.colorGrogram, "u_MVP");

    canvas.oncontextmenu = function(e) {
      e.preventDefault();
    };

    let url = 'models/ElvenRuins/ElvenRuins.gltf';
    let glTFLoader = new MinimalGLTFLoader.glTFLoader();
    glTFLoader.loadGLTF(url, (glTF)=>{
      console.log(glTF);
      let i = 0;
      let len = 0;
      for (i = 0, len = glTF.bufferViews.length; i < len; i++) {
        let bufferView = glTF.bufferViews[i];
        bufferView.createBuffer(gl);
        bufferView.bindData(gl);
      }

      let meshes = glTF.meshes;
      for (let i = 0; i < meshes.length; i++){
        let mesh = meshes[i];
        mesh.primitives.forEach((primitive)=>{
          primitive.vertexArray = gl.createVertexArray();
          gl.bindVertexArray(primitive.vertexArray);
          for (let key in primitive.attributes) {
            if (primitive.attributes.hasOwnProperty(key)) {
              let location = ATTRIBUTES[key];
              if (location !== null){
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
      
      console.timeEnd("MainInit");
    });
    this.projection = mat4.create();
    mat4.perspective(this.projection, glm.radians(45.0), canvas.width / canvas.height, 0.1, 100000.0);
    this.camera = new Camera(vec3.fromValues(0, 0, 10));
    this.axis = new Axis;
  }

  setupAttribuite(attrib, location) {
    if (attrib !== undefined) {
      let accessor = attrib;
      let bufferView = accessor.bufferView;
      if (bufferView.target === null) {
            // console.log('WARNING: the bufferview of this accessor should have a target, or it should represent non buffer data (like animation)');
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

  drawNode(node, nodeID, parentModelMatrix){
    let matrix = this.nodeMatrix[nodeID];
    
    if (parentModelMatrix !== undefined) {
      mat4.mul(matrix, parentModelMatrix, node.matrix);
    } else {
      mat4.copy(matrix, node.matrix);
    }
    
    if (node.mesh && node.mesh.primitives) {
      let primitives = node.mesh.primitives;
              
      primitives.forEach(primitive=>{
        let MVP = mat4.create();
        mat4.mul(MVP, this.camera.view, matrix);
        mat4.mul(MVP, this.projection, MVP);
        
        gl.uniformMatrix4fv(this.uniformMvpLocation, false, MVP);

        gl.bindVertexArray(primitive.vertexArray);
                
        if (primitive.indices !== null) {
          gl.drawElements(primitive.mode, primitive.indicesLength, primitive.indicesComponentType, primitive.indicesOffset);
        } else {
          gl.drawArrays(primitive.mode, primitive.drawArraysOffset, primitive.drawArraysCount);
        }
                
        gl.bindVertexArray(null);
      });
    }
    
    if (node.children) {
      let length = node.children.length;
      for (let i = 0; i < length; i++) {
        this.drawNode(node.children[i], node.children[i].nodeID, matrix);
      }
    }
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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    this.axis.draw(this.camera.view, this.projection);

    gl.useProgram(this.colorGrogram);

    let length = this.scene.nodes.length;
    for (let i = 0; i < length; i++) {
      this.drawNode(this.scene.nodes[i], this.scene.nodes[i].nodeID, this.scene.rootTransform);
    }
  }

  update(time){
    // if (this.lastTime !== undefined){
    //   let dt = (dt - this.lastTime) / 1000;
    //   this.world.step(this.fixedTimeStep, dt, this.maxSubSteps);
    // }
  }
}

window.mainApp = new Main();
