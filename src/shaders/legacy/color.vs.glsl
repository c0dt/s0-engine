precision highp float;
precision highp int;

uniform mat4 uMVP;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexcoord0;

void main()
{
    gl_Position = uMVP * vec4(position, 1.0);
}