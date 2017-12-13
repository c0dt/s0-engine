#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define TEXCOORD_0_LOCATION 2

precision highp float;
precision highp int;

uniform mat4 u_MVP;

layout(location = POSITION_LOCATION) in vec3 position;
layout(location = NORMAL_LOCATION) in vec3 normal;
layout(location = TEXCOORD_0_LOCATION) in vec2 texcoord0;

out vec2 v_texcoord0;

void main()
{
    gl_Position = u_MVP * vec4(position, 1.0);
    v_texcoord0 = texcoord0;
}