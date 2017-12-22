import { GetAccessorData, Type2NumOfComponent } from "./Utils";
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
    this._inputTypedArray = GetAccessorData(input);
    this._outputTypedArray = GetAccessorData(output);
    this._interpolation = interpolation !== undefined ? interpolation : 'LINEAR';

    this._currentIndex = 0;
    this._currentValue = vec4.create();
    this._endTime = this._inputTypedArray[this._inputTypedArray.length - 1];
    this._maxInput = this._endTime - this._inputTypedArray[0];

    this._animationOutputValueVec4a = vec4.create();
    this._animationOutputValueVec4b = vec4.create();

    this.getValue(0);
    this.getValue(11110);
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
    let count = Type2NumOfComponent[this._output.type];
    
    let v4lerp = count === 4 ? quat.slerp : vec4.lerp;

    let i = this._currentIndex;
    let o = i * count;
    let on = o + count;

    let u = Math.max(0, t - this._inputTypedArray[i]) / (this._inputTypedArray[i + 1] - this._inputTypedArray[i]);

    for (let j = 0; j < count; j++) {
      this._animationOutputValueVec4a[j] = this._outputTypedArray[o + j];
      this._animationOutputValueVec4b[j] = this._outputTypedArray[on + j];
    }

    switch (this.interpolation) {
      case 'LINEAR': 
        v4lerp(this._currentValue, this._animationOutputValueVec4a, this._animationOutputValueVec4b, u);
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
}
export default class Animation {
  constructor(name, samplers, channels) {
    this._name = name;
    this._channels = channels;
    this._samplers = samplers;
  }
}