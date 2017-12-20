export default class Skin {
  constructor({ inverseBindMatrices, joints, skeleton }) {
    this._inverseBindMatrices = inverseBindMatrices;
    this._joints = joints;
    this._skeleton = skeleton;
  }
}