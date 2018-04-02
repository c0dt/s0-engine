#define POSITION_LOCATION 0
#define COLOR_LOCATION 1

precision highp float;
precision highp int;

uniform mat4 uMVP;

out vec3 vColor;

layout(location = POSITION_LOCATION) in vec3 aPosition;
layout(location = COLOR_LOCATION) in vec3 aColors;

void main()
{
    gl_Position = uMVP * vec4(aPosition, 1.0) ;
    vColor = aColors;
}