#define FRAG_COLOR_LOCATION 0

precision highp float;
precision highp int;

in vec2 vTexCoords;

layout(location = FRAG_COLOR_LOCATION) out vec4 color;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;
uniform sampler2D gMetallicRoughness;
uniform sampler2D depthTexture;

void main()
{
    color = vec4(vec3(texture(depthTexture, vTexCoords).r), 1.0);
}