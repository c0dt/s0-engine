#version 300 es
#define POSITION_LOCATION 0
#define COLOR_LOCATION 1

precision highp float;
precision highp int;

uniform mat4 u_MVP;

out vec3 vColor;

layout(location = POSITION_LOCATION) in vec3 position;
layout(location = COLOR_LOCATION) in vec3 colors;

void main()
{
    gl_Position = u_MVP * vec4(position, 1.0) ;
    vColor = colors;
}