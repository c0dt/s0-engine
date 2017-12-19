#version 300 es
#define POSITION_LOCATION 0
#define TEXCOORD_LOCATION 1

precision highp float;
precision highp int;

layout(location = POSITION_LOCATION) in vec3 position;
layout(location = TEXCOORD_LOCATION) in vec2 aTexCoords;

uniform mat4 MVP;

out vec2 vTexCoords;

void main()
{
    gl_Position = MVP * vec4(position, 1.0) ;
    vTexCoords = aTexCoords;
}