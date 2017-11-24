#version 300 es
#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define TANGENT_LOCATION 2
#define TEXCOORD_0_LOCATION 3
#define TEXCOORD_1_LOCATION 4

precision highp float;
precision highp int;

uniform mat4 u_MVP;

out vec3 vColor;

layout(location = NORMAL_LOCATION) in vec3 normal;
layout(location = POSITION_LOCATION) in vec3 position;
layout(location = TANGENT_LOCATION) in vec3 tangent;
layout(location = TEXCOORD_0_LOCATION) in vec2 texcoord0;
layout(location = TEXCOORD_1_LOCATION) in vec2 texcoord1;

void main()
{
    gl_Position = u_MVP * vec4(position, 1.0) ;
    vColor = vec3((normal.r + normal.g + normal.b) / 3.0);
}