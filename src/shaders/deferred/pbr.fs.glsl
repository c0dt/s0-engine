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

// Find the normal for this fragment, pulling either from a predefined normal map
// or from the interpolated mesh normal and tangent attributes.
vec3 getNormal()
{
    vec3 Q1  = dFdx(vWorldPos);
    vec3 Q2  = dFdy(vWorldPos);
    vec2 st1 = dFdx(vTexcoord0);
    vec2 st2 = dFdy(vTexcoord0);

    vec3 N   = normalize(vNormal);
    vec3 T  = normalize(Q1*st2.t - Q2*st1.t);
    vec3 B  = -normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);

#ifdef HAS_NORMALS
    vec3 tangentNormal = texture(uNormalTexture, vTexcoord0).xyz * 2.0 - 1.0;
    vec3 n = normalize(TBN * tangentNormal);
#else
    vec3 n = TBN[2].xyz;
#endif

    return n;
}

void main()
{
    gPosition = vec4(vWorldPos, 1.0);
    gNormal = vec4(getNormal(), 1.0);
    gAlbedoSpec = vec4(texture(uBaseColorTexture,vTexcoord0).rgb, 1.0);
    gMetallicRoughness = vec4(texture(uMetallicRoughnessTexture, vTexcoord0).rgb, 1.0);
}