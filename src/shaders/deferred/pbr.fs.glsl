precision highp float;
precision highp int;

layout (location = 0) out vec3 gPosition;
layout (location = 1) out vec3 gNormal;
layout (location = 2) out vec3 gAlbedoSpec;
layout (location = 3) out vec3 gMetallicRoughness;

uniform sampler2D uBaseColorTexture;
uniform vec3 uCameraPosition;

in vec2 vTexcoord0;
in vec3 vWorldPos;
in vec3 vNormal;

void main()
{
    gPosition = vWorldPos;
    gNormal = vNormal;
    gAlbedoSpec = vec3(vTexcoord0, 1.0);
    gMetallicRoughness = vec3(1.0, 1.0, 1.0);
}