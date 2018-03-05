precision highp float;
precision highp int;

uniform mat4 uMVP;

attribute vec3 POSITION;
attribute vec3 NORMAL;
attribute vec2 TEXCOORD_0;

varying vec2 vTEXCOORD_0;

void main()
{
    gl_Position = uMVP * vec4(POSITION, 1.0);
    vTEXCOORD_0 = TEXCOORD_0;
}