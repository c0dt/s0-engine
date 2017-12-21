#define FRAG_COLOR_LOCATION 0

// reference: https://github.com/KhronosGroup/glTF-WebGL-PBR/blob/master/shaders/pbr-frag.glsl

precision highp float;
precision highp int;

// IBL
uniform samplerCube uDiffuseEnvSampler;
uniform samplerCube uSpecularEnvSampler;
uniform sampler2D uBrdfLUT;

// Metallic-roughness material

// base color
uniform vec4 uBaseColorFactor;
#ifdef HAS_BASECOLORMAP
uniform sampler2D uBaseColorTexture;
#endif

// normal map
#ifdef HAS_NORMALMAP
uniform sampler2D uNormalTexture;
uniform float uNormalTextureScale;
#endif

// emmisve map
#ifdef HAS_EMISSIVEMAP
uniform sampler2D uEmissiveTexture;
uniform vec3 uEmissiveFactor;
#endif

// metal roughness
#ifdef HAS_METALROUGHNESSMAP
uniform sampler2D uMetallicRoughnessTexture;
#endif
uniform float uMetallicFactor;
uniform float uRoughnessFactor;

// occlusion texture
#ifdef HAS_OCCLUSIONMAP
uniform sampler2D uOcclusionTexture;
uniform float uOcclusionStrength;
#endif

uniform vec3 uCameraPosition;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vTexcoord;

layout(location = FRAG_COLOR_LOCATION) out vec4 frag_color;

const float M_PI = 3.141592653589793;
const float c_MinRoughness = 0.04;

struct PBRInfo
{
    float NdotL;                  // cos angle between normal and light direction
    float NdotV;                  // cos angle between normal and view direction
    float NdotH;                  // cos angle between normal and half vector
    float LdotH;                  // cos angle between light direction and half vector
    float VdotH;                  // cos angle between view direction and half vector
    float perceptualRoughness;    // roughness value, as authored by the model creator (input to shader)
    float metalness;              // metallic value at the surface
    vec3 reflectance0;            // full reflectance color (normal incidence angle)
    vec3 reflectance90;           // reflectance color at grazing angle
    float alphaRoughness;         // roughness mapped to a more linear change in the roughness (proposed by [2])
    vec3 diffuseColor;            // color contribution from diffuse lighting
    vec3 specularColor;           // color contribution from specular lighting
};

vec4 SRGBtoLINEAR(vec4 srgbIn)
{
    #ifdef MANUAL_SRGB
    #ifdef SRGB_FAST_APPROXIMATION
    vec3 linOut = pow(srgbIn.xyz,vec3(2.2));
    #else //SRGB_FAST_APPROXIMATION
    vec3 bLess = step(vec3(0.04045),srgbIn.xyz);
    vec3 linOut = mix( srgbIn.xyz/vec3(12.92), pow((srgbIn.xyz+vec3(0.055))/vec3(1.055),vec3(2.4)), bLess );
    #endif //SRGB_FAST_APPROXIMATION
    return vec4(linOut,srgbIn.w);;
    #else //MANUAL_SRGB
    return srgbIn;
    #endif //MANUAL_SRGB
}

// Find the normal for this fragment, pulling either from a predefined normal map
// or from the interpolated mesh normal and tangent attributes.
vec3 getNormal()
{
    vec3 Q1  = dFdx(vPosition);
    vec3 Q2  = dFdy(vPosition);
    vec2 st1 = dFdx(vTexcoord);
    vec2 st2 = dFdy(vTexcoord);

    vec3 N   = normalize(vNormal);
    vec3 T  = normalize(Q1*st2.t - Q2*st1.t);
    vec3 B  = -normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);

#ifdef HAS_NORMALS
    vec3 tangentNormal = texture(uNormalTexture, vTexcoord).xyz * 2.0 - 1.0;
    vec3 n = normalize(TBN * tangentNormal);
#else
    vec3 n = TBN[2].xyz;
#endif

    return n;
}

vec3 getIBLContribution(PBRInfo pbrInputs, vec3 n, vec3 reflection)
{
    // float mipCount = 9.0; // resolution of 512x512
    // float mipCount = 10.0; // resolution of 1024x1024
    float mipCount = 10.0; // resolution of 256x256
    float lod = (pbrInputs.perceptualRoughness * mipCount);
    // retrieve a scale and bias to F0. See [1], Figure 3
    vec3 brdf = SRGBtoLINEAR(texture(uBrdfLUT, vec2(pbrInputs.NdotV, 1.0 - pbrInputs.perceptualRoughness))).rgb;
    vec3 diffuseLight = SRGBtoLINEAR(texture(uDiffuseEnvSampler, n)).rgb;
    vec3 specularLight = SRGBtoLINEAR(texture(uSpecularEnvSampler, reflection, lod)).rgb;
    vec3 diffuse = diffuseLight * pbrInputs.diffuseColor;
    vec3 specular = specularLight * (pbrInputs.specularColor * brdf.x + brdf.y);
    return diffuse + specular;
}

// Basic Lambertian diffuse
// Implementation from Lambert's Photometria https://archive.org/details/lambertsphotome00lambgoog
// See also [1], Equation 1
vec3 diffuse(PBRInfo pbrInputs)
{
    return pbrInputs.diffuseColor / M_PI;
}

// The following equation models the Fresnel reflectance term of the spec equation (aka F())
// Implementation of fresnel from [4], Equation 15
vec3 specularReflection(PBRInfo pbrInputs)
{
    return pbrInputs.reflectance0 + (pbrInputs.reflectance90 - pbrInputs.reflectance0) * pow(clamp(1.0 - pbrInputs.VdotH, 0.0, 1.0), 5.0);
}

// This calculates the specular geometric attenuation (aka G()),
// where rougher material will reflect less light back to the viewer.
// This implementation is based on [1] Equation 4, and we adopt their modifications to
// alphaRoughness as input as originally proposed in [2].
float geometricOcclusion(PBRInfo pbrInputs)
{
    float NdotL = pbrInputs.NdotL;
    float NdotV = pbrInputs.NdotV;
    float r = pbrInputs.alphaRoughness;

    float attenuationL = 2.0 * NdotL / (NdotL + sqrt(r * r + (1.0 - r * r) * (NdotL * NdotL)));
    float attenuationV = 2.0 * NdotV / (NdotV + sqrt(r * r + (1.0 - r * r) * (NdotV * NdotV)));
    return attenuationL * attenuationV;
}


// The following equation(s) model the distribution of microfacet normals across the area being drawn (aka D())
// Implementation from "Average Irregularity Representation of a Roughened Surface for Ray Reflection" by T. S. Trowbridge, and K. P. Reitz
// Follows the distribution function recommended in the SIGGRAPH 2013 course notes from EPIC Games [1], Equation 3.
float microfacetDistribution(PBRInfo pbrInputs)
{
    float roughnessSq = pbrInputs.alphaRoughness * pbrInputs.alphaRoughness;
    float f = (pbrInputs.NdotH * roughnessSq - pbrInputs.NdotH) * pbrInputs.NdotH + 1.0;
    return roughnessSq / (M_PI * f * f);
}

void main()
{
    float perceptualRoughness = uRoughnessFactor;
    float metallic = uMetallicFactor;
#ifdef HAS_METALROUGHNESSMAP
    // Roughness is stored in the 'g' channel, 
    // Metallic is stored in the 'b' channel.
    // This layout intentionally reserves the 'r' channel for (optional) occlusion map data
    vec4 mrSample = texture(uMetallicRoughnessTexture, vTexcoord);
    perceptualRoughness = mrSample.g * perceptualRoughness;
    metallic = mrSample.b * metallic;
#endif
    perceptualRoughness = clamp(perceptualRoughness, c_MinRoughness, 1.0);
    metallic = clamp(metallic, 0.0, 1.0);
    // Roughness is authored as perceptual roughness; as is convention,
    // convert to material roughness by squaring the perceptual roughness [2].
    float alphaRoughness = perceptualRoughness * perceptualRoughness;

    // The albedo may be defined from a base texture or a flat color
#ifdef HAS_BASECOLORMAP
    vec4 baseColor = SRGBtoLINEAR(texture(uBaseColorTexture, vTexcoord)) * uBaseColorFactor;
#else
    vec4 baseColor = uBaseColorFactor;
#endif
    vec3 f0 = vec3(0.04);
    vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0);
    diffuseColor *= 1.0 - metallic;
    vec3 specularColor = mix(f0, baseColor.rgb, metallic);
    
    // Compute reflectance.
    float reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);
    
    // For typical incident reflectance range (between 4% to 100%) set the grazing reflectance to 100% for typical fresnel effect.
    // For very low reflectance range on highly diffuse objects (below 4%), incrementally reduce grazing reflecance to 0%.
    float reflectance90 = clamp(reflectance * 25.0, 0.0, 1.0);
    
    vec3 specularEnvironmentR0 = specularColor.rgb;
    vec3 specularEnvironmentR90 = vec3(1.0, 1.0, 1.0) * reflectance90;
    vec3 n = getNormal();                             // normal at surface point
    
    // vec3 v = vec3( 0.0, 0.0, 1.0 );        // Vector from surface point to camera
    vec3 v = normalize(uCameraPosition-vPosition);                       // Vector from surface point to camera
    // vec3 l = normalize(u_LightDirection);             // Vector from surface point to light
    vec3 l = normalize(vec3( 1.0, 1.0, 1.0 ));             // Vector from surface point to light
    // vec3 l = vec3( 0.0, 0.0, 1.0 );             // Vector from surface point to light
    vec3 h = normalize(l+v);                          // Half vector between both l and v
    vec3 reflection = -normalize(reflect(v, n));

    float NdotL = clamp(dot(n, l), 0.001, 1.0);
    float NdotV = abs(dot(n, v)) + 0.001;
    float NdotH = clamp(dot(n, h), 0.0, 1.0);
    float LdotH = clamp(dot(l, h), 0.0, 1.0);
    float VdotH = clamp(dot(v, h), 0.0, 1.0);

    PBRInfo pbrInputs = PBRInfo(
        NdotL,
        NdotV,
        NdotH,
        LdotH,
        VdotH,
        perceptualRoughness,
        metallic,
        specularEnvironmentR0,
        specularEnvironmentR90,
        alphaRoughness,
        diffuseColor,
        specularColor
    );

    // Calculate the shading terms for the microfacet specular shading model
    vec3 F = specularReflection(pbrInputs);
    float G = geometricOcclusion(pbrInputs);
    float D = microfacetDistribution(pbrInputs);
    // Calculation of analytical lighting contribution
    vec3 diffuseContrib = (1.0 - F) * diffuse(pbrInputs);
    vec3 specContrib = F * G * D / (4.0 * NdotL * NdotV);
    // vec3 color = NdotL * u_LightColor * (diffuseContrib + specContrib);
    vec3 color = NdotL * (diffuseContrib + specContrib);    // assume light color vec3(1, 1, 1)

// Calculate lighting contribution from image based lighting source (IBL)
// #ifdef USE_IBL
    color += getIBLContribution(pbrInputs, n, reflection);
// #endif
    // Apply optional PBR terms for additional (optional) shading
#ifdef HAS_OCCLUSIONMAP
    float ao = texture(uOcclusionTexture, v_uv).r;
    color = mix(color, color * ao, u_occlusionStrength);
#endif

#ifdef HAS_EMISSIVEMAP
    vec3 emissive = SRGBtoLINEAR(texture(uEmissiveTexture, v_uv)).rgb * u_emissiveFactor;
    color += emissive;
#endif
    
    frag_color = vec4(color, baseColor.a);
}