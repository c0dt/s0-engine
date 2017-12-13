const PI_DIV_180 = Math.PI / 180;
export const glm = {
  radians(v) {
    return v * PI_DIV_180;
  },
  degrees(v) {
    return v / PI_DIV_180;
  }
};