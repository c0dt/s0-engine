import * as THREE from 'three';
import CANNON from 'cannon';
import vertexShader from './shaders/sample.vert';
import fragmentShader from './shaders/sample.frag';

export default class Main {
  constructor() {
    this._initPhysics();
    let axis = new THREE.AxisHelper(1000);
    axis.position.set(0, 10, 0);  
    
    this.scene = new THREE.Scene();
    this.scene.add(axis);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
    this.camera.position.x = 1000;
    this.camera.position.y = 1000;
    this.camera.position.z = 1000;

    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    // this.camera = new THREE.Camera();
    // this.camera.position.z = 1;
    this.planeGeometry = new THREE.PlaneBufferGeometry(10000, 10000, 100, 100);
    this.geometry = new THREE.SphereGeometry(100);
    
    this.material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
    this.uniforms = {
      time: {
        value: 1.0
      },
      resolution: {
        value: new THREE.Vector2()
      }
    };

    // this.material = new THREE.ShaderMaterial({
    //   uniforms: this.uniforms,
    //   vertexShader: vertexShader,
    //   fragmentShader: fragmentShader
    // });
    let plane = new THREE.Mesh(this.planeGeometry, this.material);
    this.scene.add(plane);

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.mesh);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    this.animate();

    this.gui = new dat.GUI();
    this.gui.add(this.camera.position, 'x', -1000, 1000);
    this.gui.add(this.camera.position, 'y', -5, 1000);
    this.gui.add(this.camera.position, 'z', -1000, 1000);

    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

  }

  _initPhysics(){
        // Setup our world
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, -98.2); // m/s²
    // Create a sphere
    let radius = 100; // m
    this.sphereBody = new CANNON.Body({
      mass: 5, // kg
      position: new CANNON.Vec3(0, 500, 1000), // m
      shape: new CANNON.Sphere(radius)
    });
    this.world.addBody(this.sphereBody);
    
    // Create a plane
    this.groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
    });
    let groundShape = new CANNON.Plane();
    this.groundBody.addShape(groundShape);
    this.world.addBody(this.groundBody);
    
    this.fixedTimeStep = 1.0 / 60.0; // seconds
    this.maxSubSteps = 3;
    this.lastTime = undefined;

    this.sphereBody.applyLocalImpulse(new CANNON.Vec3(-500, -500, 0), new CANNON.Vec3(100, 100, 100));
  }

  onWindowResize(event) {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.uniforms.resolution.value.x = this.renderer.domElement.width;
    this.uniforms.resolution.value.y = this.renderer.domElement.height;
  }
  animate(time) {
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.update(time);
    // this.stats.update()
    // window.requestAnimationFrame(this.animate.bind(this))
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += 0.02;
    this.uniforms.time.value += 0.05;
  }

  render() {
    this.uniforms.time.value += 0.05;
    this.renderer.render(this.scene, this.camera);
  }

  update(time){
    if (this.lastTime !== undefined){
      let dt = (dt - this.lastTime) / 1000;
      this.world.step(this.fixedTimeStep, dt, this.maxSubSteps);
    }
    this.mesh.position.x = this.sphereBody.position.x;
    this.mesh.position.y = this.sphereBody.position.y;
    this.mesh.position.z = this.sphereBody.position.z;
    this.mesh.quaternion.x = this.sphereBody.quaternion.x;
    this.mesh.quaternion.y = this.sphereBody.quaternion.y;
    this.mesh.quaternion.z = this.sphereBody.quaternion.z;
    this.mesh.quaternion.w = this.sphereBody.quaternion.w;
    this.lastTime = time;
  }
}

window.mainApp = new Main();