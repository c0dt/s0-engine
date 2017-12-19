precision highp float;
precision highp int;

layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec4 gNormal;
layout (location = 2) out vec4 gAlbedoSpec;
layout (location = 3) out vec4 gMetallicRoughness;

uniform sampler2D uBaseColorTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uMetallicRoughnessTexture;

uniform vec3 uCameraPosition;

in vec2 vTexcoord0;
in vec3 vWorldPos;
in vec3 vNormal;


void main()
{
    gPosition = vec4(vWorldPos, 1.0);
    gNormal = vec4(texture(uNormalTexture,vTexcoord0).rgb, 1.0);
    gAlbedoSpec = vec4(texture(uBaseColorTexture,vTexcoord0).rgb, 1.0);
    gMetallicRoughness = vec4(texture(uMetallicRoughnessTexture, vTexcoord0).rgb, 1.0);
}