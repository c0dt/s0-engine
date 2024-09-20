import { mat4 } from "gl-matrix";
import S0 from '../S0';
import RenderingContextObject from "./RenderingContextObject";
import Accessor from "./Accessor";

const NUM_MAX_JOINTS = 65;
let UniformBlockIDCounter = 0;

export default class Skin extends RenderingContextObject {
  private _inverseBindMatrices: Accessor;
  private _joints: any;
  private _skeleton: any;
  private _uniformBlockID: number;
  private _inverseBindMatricesData: any;
  private _inverseBindMatrix: mat4[] = [];
  private _jointMatrixUniformBufferData: AllowSharedBufferSource | undefined;
  private _jointMatrixUniformBuffer: WebGLBuffer | null;
  constructor(params:{ inverseBindMatrices:Accessor, joints:any, skeleton:any }) {
    super();
    const { inverseBindMatrices, joints, skeleton } = params;

    this._inverseBindMatrices = inverseBindMatrices;
    this._joints = joints;
    this._skeleton = skeleton;
    this._uniformBlockID = UniformBlockIDCounter++;

    if (inverseBindMatrices) {
      // should be a mat4
      this._inverseBindMatricesData = inverseBindMatrices.data;
      this._inverseBindMatrix = []; // for calculation
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


    this._jointMatrixUniformBuffer = this.RenderingContext.createBuffer();

    if (S0.isWebGL2) {
      //@ts-ignore
      this.RenderingContext.bindBufferBase(this.RenderingContext.UNIFORM_BUFFER, this._uniformBlockID, this._jointMatrixUniformBuffer);
      //@ts-ignore
      this.RenderingContext.bindBuffer(this.RenderingContext.UNIFORM_BUFFER, this._jointMatrixUniformBuffer);
      //@ts-ignore
      this.RenderingContext.bufferData(this.RenderingContext.UNIFORM_BUFFER, this._jointMatrixUniformBufferData, this.RenderingContext.DYNAMIC_DRAW);
      //@ts-ignore
      this.RenderingContext.bufferSubData(this.RenderingContext.UNIFORM_BUFFER, 0, this._jointMatrixUniformBufferData);
      //@ts-ignore
      this.RenderingContext.bindBuffer(this.RenderingContext.UNIFORM_BUFFER, null);
    }
  }

  get uniformBlockID() {
    return this._uniformBlockID;
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