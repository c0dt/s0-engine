export default class glMatrixVec3Proxy{
  constructor(vec3Target) {
    this._vec3 = vec3Target;
  }
    
  get x(){
    return this._vec3[0];
  }
    
  set x(v){
    this._vec3[0] = v;
  }
    
  get y(){
    return this._vec3[1];
  }
    
  set y(v){
    this._vec3[1] = v;
  }
    
  get z(){
    return this._vec3[2];
  }
    
  set z(v){
    this._vec3[2] = v;
  }
    
}