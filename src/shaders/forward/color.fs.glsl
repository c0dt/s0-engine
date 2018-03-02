#define FRAG_COLOR_LOCATION 0

precision highp float;
precision highp int;

uniform vec4 uBaseColorFactor;

layout(location = FRAG_COLOR_LOCATION) out vec4 color;


void main()
{
    color = uBaseColorFactor;
}