#define FRAG_COLOR_LOCATION 0

precision highp float;
precision highp int;

layout(location = FRAG_COLOR_LOCATION) out vec4 color;

uniform sampler2D u_baseColorTexture;

in vec2 v_texcoord0;

void main()
{
    color = texture(u_baseColorTexture, v_texcoord0);
}