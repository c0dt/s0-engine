#define FRAG_COLOR_LOCATION 0

precision highp float;
precision highp int;

// in vec3 vColor;
in vec2 vTexCoord;

layout(location = FRAG_COLOR_LOCATION) out vec4 color;
uniform sampler2D albedo;

void main()
{
    color = vec4(vTexCoord,1.0,1.0);
}