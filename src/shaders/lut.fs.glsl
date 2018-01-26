
#version 330 core
out vec4 lutPass;

in vec2 uv;

uniform sampler2D combinePass;
uniform sampler2D lut;

void main() {
	
	vec3 combineColor = texture(combinePass, uv).rgb;

	// blue channel index
	float blueIndex = floor(combineColor.b * 16.0); // 0 ~ 15

	// lut mapping
	highp vec2 uvMapping;
	uvMapping.x = 1.0 / 512.0 + 15.0 * combineColor.r / 256.0;
	uvMapping.y = 1.0 / 32.0;
	// uvMapping.x = blueIndex / 16.0 + 1.0 / 256.0;
	// uvMapping.y = 1.0 / 32.0;

	//
	// mediump float blueColor = combineColor.b * 63.0;
	//
	// mediump vec2 quad1;
	// quad1.y = floor(floor(blueColor) / 8.0);
	// quad1.x = floor(blueColor) - (quad1.y * 8.0);
	//
	// mediump vec2 quad2;
	// quad2.y = floor(ceil(blueColor) / 8.0);
	// quad2.x = ceil(blueColor) - (quad2.y * 8.0);
	//
	// highp vec2 texPos1;
	// texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * combineColor.r);
	// texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * combineColor.g);
	//
	// highp vec2 texPos2;
	// texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * combineColor.r);
	// texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * combineColor.g);
	//
	// lowp vec4 newColor1 = texture(lut, texPos1);
	// lowp vec4 newColor2 = texture(lut, texPos2);
	//
	// lutPass = mix(newColor1, newColor2, fract(blueColor));

	lutPass = vec4(texture(lut, uvMapping).rgb, 1);
}
