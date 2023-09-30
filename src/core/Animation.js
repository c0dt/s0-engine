import { vec4, quat } from "gl-matrix";

export class AnimationSampler {
  /**
     * 
     * @param {*} input 
     * @param {*} output 
     * @param {*} interpolation LINEAR|STEP|CATMULLROMSPLINE|CUBICSPLINE
     */
  constructor(input, output, interpolation) {
    this._input = input;
    this._output = output;
    this._inputTypedArray = input.data;
    this._outputTypedArray = output.data;
    this._interpolation = interpolation !== undefined ? interpolation : 'LINEAR';

    this._currentIndex = 0;
    this._currentValue = vec4.create();
    this._endTime = this._inputTypedArray[this._inputTypedArray.length - 1];
    this._maxInput = this._endTime - this._inputTypedArray[0];

    this._outputValueA = vec4.create();
    this._outputValueB = vec4.create();
  }

  get currentValue() {
    return this._currentValue;
  }

  getValue(t) {
    if (t > this._endTime) {
      t -= this._maxInput * Math.ceil((t - this._endTime) / this._maxInput);
      this._currentIndex = 0;
    }

    let length = this._inputTypedArray.length;
    while (this._currentIndex <= length - 2 && t >= this._inputTypedArray[this._currentIndex + 1]) {
      this._currentIndex++;
    }

    if (this._currentIndex >= length - 1) {
      // loop
      t -= this._maxInput;
      this._currentIndex = 0;
    }

    // @tmp: assume no stride
    let count = this._output.size; 
    let v4lerp = count === 4 ? quat.slerp : vec4.lerp;
    let i = this._currentIndex;
    let offset = i * count;
    let offsetNext = (i + 1) * count;

    let u = Math.max(0, t - this._inputTypedArray[i]) / (this._inputTypedArray[i + 1] - this._inputTypedArray[i]);

    for (let j = 0; j < count; j++) {
      this._outputValueA[j] = this._outputTypedArray[offset + j];
      this._outputValueB[j] = this._outputTypedArray[offsetNext + j];
    }

    switch (this._interpolation) {
      case 'LINEAR': 
        v4lerp(this._currentValue, this._outputValueA, this._outputValueB, u);
        break;
      default:
        break;
    }
  }
}
export class AnimationChannel {
  constructor(sampler, target) {
    this._sampler = sampler;
    this._target = target;
  }

  get sampler() {
    return this._sampler;
  }

  get target() {
    return this._target;
  }
}
export default class Animation {
  constructor(name, samplers, channels) {
    this._name = name;
    this._channels = channels;
    this._samplers = samplers;
  }

  get name() {
    return this._name;
  }

  get channels() {
    return this._channels;
  }

  get samplers() {
    return this._samplers;
  }
}