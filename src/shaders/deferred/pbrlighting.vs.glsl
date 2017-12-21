#define POSITION_LOCATION 0
#define TEXCOORD_LOCATION 1

precision highp float;
precision highp int;

layout(location = POSITION_LOCATION) in vec3 aPosition;
layout(location = TEXCOORD_LOCATION) in vec2 aTexCoord;

out vec2 vTexcoord;

void main()
{
    gl_Position = vec4(aPosition, 1.0) ;
    vTexcoord = aTexCoord;
}