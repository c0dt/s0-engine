class AudioManager {
  constructor() {
    let contextClass = window.AudioContext || 
    window.webkitAudioContext || 
    window.mozAudioContext || 
    window.oAudioContext || 
    window.msAudioContext;
    if (contextClass) {
      console.log("%c 😀Web Audio API is available.", 'background: #222; color: #bada55');
      this._context = new contextClass();
      console.log(this._context);
    } else {
      console.log("%c Web Audio API is not available. Ask the user to use a supported browser.", 'background: #222; color: #bada55');
    }
  }

  test() {
    // Create the source.
    let source = this._context.createBufferSource();
    // Create the gain node.
    let gain = this._context.createGain();
    // Connect source to filter, filter to destination.
    source.connect(gain);
    gain.connect(this._context.destination);
    source.disconnect(0);
    gain.disconnect(0);
    source.connect(this._context.destination);
  }

  get context() {
    return this._context;
  }

  testPlaySound(buffer) {
    let source = this._context.createBufferSource();
    source.buffer = buffer;
    source.connect(this._context.destination);
    source.start(0);
  }
}

const _instance = new AudioManager;

export default _instance;