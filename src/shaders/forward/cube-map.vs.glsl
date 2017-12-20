precision highp float;
precision highp int;

uniform mat4 uMVP;

layout(location = 0) in vec3 position;

out vec3 texcoord;

void main()
{
    vec4 pos = uMVP * vec4(position, 1.0);
    gl_Position = pos.xyww;
    texcoord = position;
}