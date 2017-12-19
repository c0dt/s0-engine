#define FRAG_COLOR_LOCATION 0

precision highp float;
precision highp int;

layout(location = FRAG_COLOR_LOCATION) out vec4 color;

uniform sampler2D uBaseColorTexture;

in vec2 vTexcoord0;

void main()
{
    color = texture(uBaseColorTexture, vTexcoord0);
}