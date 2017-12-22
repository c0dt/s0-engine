import { GetAccessorData } from "./Utils";
import { mat4 } from "gl-matrix";
const NUM_MAX_JOINTS = 65;

export default class Skin {
  constructor({ inverseBindMatrices, joints, skeleton }) {
    this._inverseBindMatrices = inverseBindMatrices;
    this._joints = joints;
    this._skeleton = skeleton;

    if (inverseBindMatrices) {
      // should be a mat4
      this._inverseBindMatricesData = GetAccessorData(inverseBindMatrices);
      this._inverseBindMatrix = [];  // for calculation
      // @tmp: fixed length to coordinate with shader, for copy to UBO
      this._jointMatrixUniformBufferData = new Float32Array(NUM_MAX_JOINTS * 16);

      for (let i = 0, len = this._inverseBindMatricesData.length; i < len; i += 16) {
        this._inverseBindMatrix.push(mat4.fromValues(
              this._inverseBindMatricesData[i],
              this._inverseBindMatricesData[i + 1],
              this._inverseBindMatricesData[i + 2],
              this._inverseBindMatricesData[i + 3],
              this._inverseBindMatricesData[i + 4],
              this._inverseBindMatricesData[i + 5],
              this._inverseBindMatricesData[i + 6],
              this._inverseBindMatricesData[i + 7],
              this._inverseBindMatricesData[i + 8],
              this._inverseBindMatricesData[i + 9],
              this._inverseBindMatricesData[i + 10],
              this._inverseBindMatricesData[i + 11],
              this._inverseBindMatricesData[i + 12],
              this._inverseBindMatricesData[i + 13],
              this._inverseBindMatricesData[i + 14],
              this._inverseBindMatricesData[i + 15]
          ));
      }
    }


    this._jointMatrixUniformBuffer = gl.createBuffer();

    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, this._jointMatrixUniformBuffer);

    gl.bindBuffer(gl.UNIFORM_BUFFER, this._jointMatrixUniformBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, this._jointMatrixUniformBufferData, gl.DYNAMIC_DRAW);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this._jointMatrixUniformBufferData);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
  }

  get joints() {
    return this._joints;
  }

  get jointMatrixUniformBuffer() {
    return this._jointMatrixUniformBuffer;
  }

  get jointMatrixUniformBufferData() {
    return this._jointMatrixUniformBufferData;
  }

  get inverseBindMatrices() {
    return this._inverseBindMatrix;
  }
}