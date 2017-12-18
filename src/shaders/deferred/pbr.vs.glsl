#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define TEXCOORD_0_LOCATION 2

precision highp float;
precision highp int;

uniform mat4 uM;
uniform mat4 uVP;

layout(location = POSITION_LOCATION) in vec3 aPosition;
layout(location = NORMAL_LOCATION) in vec3 aNormal;
layout(location = TEXCOORD_0_LOCATION) in vec2 aTexCoords;

out vec2 vTexcoord0;
out vec3 vWorldPos;
out vec3 vNormal;

void main()
{
    vTexcoord0 = aTexCoords;
    vWorldPos = vec3(uM * vec4(aPosition, 1.0));
    vNormal = mat3(uVP) * aNormal;
    
    gl_Position =  uVP * vec4(vWorldPos, 1.0);
}