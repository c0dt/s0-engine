#version 300 es
#define FRAG_COLOR_LOCATION 0

precision highp float;
precision highp int;

in vec2 vTexCoords;

layout(location = FRAG_COLOR_LOCATION) out vec4 color;

uniform sampler2D texture_0;

void main()
{
    color = texture(texture_0, vTexCoords);
}