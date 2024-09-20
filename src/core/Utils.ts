
// TODO: get from gl context
export const ComponentType2ByteSize: {[key: number]: number} = {
  5120: 1, // BYTE
  5121: 1, // UNSIGNED_BYTE
  5122: 2, // SHORT
  5123: 2, // UNSIGNED_SHORT
  5125: 4, // UNSIGNED_INT
  5126: 4 // FLOAT
};
  
export const ComponentType2ArrayType: {[key: number]: any} = {
  5120: Int8Array, // BYTE
  5121: Uint8Array, // UNSIGNED_BYTE
  5122: Int16Array, // SHORT
  5123: Uint16Array, // UNSIGNED_SHORT
  5125: Uint32Array, // UNSIGNED_INT
  5126: Float32Array // FLOAT
};
  
export const Type2NumOfComponent:{[key: string]: number} = {
  'SCALAR': 1,
  'VEC2': 2,
  'VEC3': 3,
  'VEC4': 4,
  'MAT2': 4,
  'MAT3': 9,
  'MAT4': 16
};

export const TextureFilterMode:{[key: string]: number} = {
  "Point": 0,
  "Bilinear": 1,
  "Triliner": 2
};