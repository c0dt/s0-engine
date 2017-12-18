#define FRAG_COLOR_LOCATION 0

precision highp float;
precision highp int;

in vec2 vTexCoords;

layout(location = FRAG_COLOR_LOCATION) out vec4 color;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;
uniform sampler2D gMetallicRoughness;

void main()
{
    color = texture(gAlbedoSpec, vTexCoords);
}