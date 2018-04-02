#define FRAG_COLOR_LOCATION 0

precision highp float;
precision highp int;

in vec3 vColor;

layout(location = FRAG_COLOR_LOCATION) out vec4 color;

void main()
{
    color = vec4(vColor, 1.0);
}