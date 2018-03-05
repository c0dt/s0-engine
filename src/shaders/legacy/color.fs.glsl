precision highp float;
precision highp int;

uniform vec4 uBaseColorFactor;
uniform sampler2D uBaseColorTexture;

varying vec2 vTEXCOORD_0;

void main()
{
    gl_FragColor = texture2D(uBaseColorTexture, vTEXCOORD_0) * uBaseColorFactor;
}