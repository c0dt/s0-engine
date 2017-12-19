#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define TEXCOORD_0_LOCATION 2

precision highp float;
precision highp int;

uniform mat4 uMVP;

layout(location = POSITION_LOCATION) in vec3 aPosition;
layout(location = TEXCOORD_0_LOCATION) in vec2 aTexcoord0;

out vec2 vTexcoord0;

void main()
{
    vTexcoord0 = aTexcoord0;
    gl_Position = uMVP * vec4(aPosition, 1.0);
}