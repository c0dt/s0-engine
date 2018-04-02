// #define FRAG_COLOR_LOCATION 0

// precision highp float;
// precision highp int;

// in vec2 vTexCoord;

// layout(location = FRAG_COLOR_LOCATION) out vec4 color;

// uniform sampler2D compositeTexture;
// uniform sampler2D depthTexture;

// void main()
// {
//     color = vec4(vec3(texture(compositeTexture, vTexCoord)), 1.0);
// }
#define FRAG_COLOR_LOCATION 0

precision highp float;
precision highp int;

in vec2 vTexCoord;
uniform sampler2D compositeTexture;

uniform vec2 delta;
uniform vec2 resolution;

layout(location = FRAG_COLOR_LOCATION) out vec4 color;

void main() {

	vec2 dir = vTexCoord - vec2( .5 );
	float d = .7 * length( dir );
	normalize( dir );
	vec2 value = d * dir * delta;

	vec4 c1 = texture( compositeTexture, vTexCoord - value / resolution.x );
	vec4 c2 = texture( compositeTexture, vTexCoord );
	vec4 c3 = texture( compositeTexture, vTexCoord + value / resolution.y );
	
	color = vec4( c1.r, c2.g, c3.b, c1.a + c2.a + c3.b );
}