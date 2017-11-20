export default class Main {
  constructor() {
    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    window.requestAnimationFrame(this.animate.bind(this));
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
    console.log('render');
    // this.renderer.render(this.scene, this.camera);
  }

  update(time){
    // if (this.lastTime !== undefined){
    //   let dt = (dt - this.lastTime) / 1000;
    //   this.world.step(this.fixedTimeStep, dt, this.maxSubSteps);
    // }
  }
}

window.mainApp = new Main();