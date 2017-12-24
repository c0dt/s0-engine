#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define TEXCOORD_0_LOCATION 2
#define JOINTS_0_LOCATION 3
#define WEIGHTS_0_LOCATION 4
#define JOINTS_1_LOCATION 5
#define WEIGHTS_1_LOCATION 6
#define TANGENT_LOCATION 7

precision highp float;
precision highp int;

uniform mat4 uMVP;
uniform mat4 uM;
uniform mat4 uMVNormal;

#ifdef HAS_SKIN
uniform JointMatrix
{
    mat4 matrix[65];
} uJointMatrix;
#endif

layout(location = POSITION_LOCATION) in vec3 aPosition;
layout(location = NORMAL_LOCATION) in vec3 aNormal;
layout(location = TEXCOORD_0_LOCATION) in vec2 aTexcoord;

#ifdef HAS_SKIN
layout(location = JOINTS_0_LOCATION) in vec4 aJoint0;
layout(location = WEIGHTS_0_LOCATION) in vec4 aWeight0;
#ifdef SKIN_VEC8
layout(location = JOINTS_1_LOCATION) in vec4 aJoint1;
layout(location = WEIGHTS_1_LOCATION) in vec4 aWeight1;
#endif
#endif

out vec3 vPosition;
out vec3 vNormal;
out vec2 vTexcoord;

void main()
{
#ifdef HAS_SKIN
    mat4 skinMatrix = 
    aWeight0.x * uJointMatrix.matrix[int(aJoint0.x)] +
    aWeight0.y * uJointMatrix.matrix[int(aJoint0.y)] +
    aWeight0.z * uJointMatrix.matrix[int(aJoint0.z)] +
    aWeight0.w * uJointMatrix.matrix[int(aJoint0.w)];
#ifdef SKIN_VEC8
    skinMatrix +=
    aWeight1.x * uJointMatrix.matrix[int(aJoint1.x)] +
    aWeight1.y * uJointMatrix.matrix[int(aJoint1.y)] +
    aWeight1.z * uJointMatrix.matrix[int(aJoint1.z)] +
    aWeight1.w * uJointMatrix.matrix[int(aJoint1.w)];
#endif
#endif
    vTexcoord = aTexcoord;
#ifdef HAS_SKIN
    vNormal = mat3(uM * skinMatrix) * aNormal;
    vec4 pos = uM * skinMatrix * vec4(aPosition, 1.0);
    gl_Position = uMVP * skinMatrix * vec4(aPosition, 1.0);
#else
    vNormal = mat3(uM) * aNormal;
    vec4 pos = uM * vec4(aPosition, 1.0);
    gl_Position = uMVP * vec4(aPosition, 1.0);
#endif
    vPosition = vec3(pos);
}