import { vec3, vec4, quat, mat4 } from 'gl-matrix';
const scenes = [];
export default class Scene{

  constructor(glTFScene, glTF, id){
    this.glTFScene = glTFScene;
    this.glTF = glTF;
    this.id = id;

        // runtime renderer context
    this.rootTransform = mat4.create();
        // @temp, assume every node is in current scene
    this.nodeMatrix = new Array(glTF.nodes.length);
    let i, len;
    for (i = 0, len = this.nodeMatrix.length; i < len; i++) {
      this.nodeMatrix[i] = mat4.create();
    }
  }

  setupAttribuite(attrib, location) {
    if (attrib !== undefined) {
      // var accessor = glTF.accessors[ attrib ];
      let accessor = attrib;
      let bufferView = accessor.bufferView;
      if (bufferView.target === null) {
        // console.log('WARNING: the bufferview of this accessor should have a target, or it should represent non buffer data (like animation)');
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferView.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, bufferView.data, gl.STATIC_DRAW);
      } else {
        gl.bindBuffer(bufferView.target, bufferView.buffer);
      }
      accessor.prepareVertexAttrib(location, gl);
      return true;
    }
    return false;
  }

  setupScene(glTF, replaceScene) {
    let i, len;

    // ----------------
    
    let curGltfScene = glTF.scenes[glTF.defaultScene];

    let newGltfRuntimeScene;
    if (!replaceScene) {
      newGltfRuntimeScene = new Scene(curGltfScene, glTF, scenes.length);
      scenes.push(newGltfRuntimeScene);
    } else {
      newGltfRuntimeScene = scenes[replaceScene.id] = new Scene(curGltfScene, glTF, replaceScene.id);
    }
    
    // var in loop
    let mesh;
    let primitive;
    let vertexBuffer;
    let indexBuffer;
    let vertexArray;

    let nid, lenNodes;
    let mid, lenMeshes;
    
    let attribute;
    let material;

    let image, texture, sampler;

    let accessor, bufferView;

    let animation, animationSampler, channel;

    let skin;

    // create buffers
    for (i = 0, len = glTF.bufferViews.length; i < len; i++) {
      bufferView = glTF.bufferViews[i];
      bufferView.createBuffer(gl);
      bufferView.bindData(gl);
    }

    
    // create textures
    if (glTF.textures) {
      for (i = 0, len = glTF.textures.length; i < len; i++) {
        texture = glTF.textures[i];
        texture.createTexture(gl);
      }
    }

    // create samplers
    if (glTF.samplers) {
      for (i = 0, len = glTF.samplers.length; i < len; i++) {
        sampler = glTF.samplers[i];
            
        sampler.createSampler(gl);
      }
    }

    if (glTF.skins) {
        // gl.useProgram(programSkinBaseColor.program);
        // gl.uniformBlockBinding(programSkinBaseColor.program, programSkinBaseColor.uniformBlockIndexJointMatrix, 0);
        // gl.useProgram(null);
      for (i = 0, len = glTF.skins.length; i < len; i++) {
        skin = glTF.skins[i];
            
        skin.jointMatrixUniformBuffer = gl.createBuffer();

            // gl.bindBufferBase(gl.UNIFORM_BUFFER, i, skin.jointMatrixUniformBuffer);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, skin.uniformBlockID, skin.jointMatrixUniformBuffer);

        gl.bindBuffer(gl.UNIFORM_BUFFER, skin.jointMatrixUniformBuffer);
        gl.bufferData(gl.UNIFORM_BUFFER, skin.jointMatrixUnidormBufferData, gl.DYNAMIC_DRAW);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, skin.jointMatrixUnidormBufferData);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
      }
    }

    // create vaos & materials shader source setup
    for (mid = 0, lenMeshes = glTF.meshes.length; mid < lenMeshes; mid++) {
      mesh = glTF.meshes[mid];
        // vertexArrayMaps[mid] = [];

      for (i = 0, len = mesh.primitives.length; i < len; ++i) {
        primitive = mesh.primitives[i];
        primitive.shader = new Shader();
            // WebGL2: create vertexArray
        primitive.vertexArray = vertexArray = gl.createVertexArray();
        gl.bindVertexArray(vertexArray);
            
            
        setupAttribuite(primitive.attributes.POSITION, POSITION_LOCATION);
        setupAttribuite(primitive.attributes.NORMAL, NORMAL_LOCATION);

            // @tmp, should consider together with material
        setupAttribuite(primitive.attributes.TEXCOORD_0, TEXCOORD_0_LOCATION);
            

        if (
                setupAttribuite(primitive.attributes.JOINTS_0, JOINTS_0_LOCATION) &&
                setupAttribuite(primitive.attributes.WEIGHTS_0, WEIGHTS_0_LOCATION)
            ) {
                // assume these two attributes always appear together
          primitive.shader.defineMacro('HAS_SKIN');
        }
            

        if (
                setupAttribuite(primitive.attributes.JOINTS_1, JOINTS_1_LOCATION) &&
                setupAttribuite(primitive.attributes.WEIGHTS_1, WEIGHTS_1_LOCATION)
            ) {
                // assume these two attributes always appear together
          primitive.shader.defineMacro('SKIN_VEC8');
        }

            // indices ( assume use indices )
        if (primitive.indices !== null) {
          accessor = glTF.accessors[ primitive.indices ];
          bufferView = accessor.bufferView;
          if (bufferView.target === null) {
                    // console.log('WARNING: the bufferview of this accessor should have a target, or it should represent non buffer data (like animation)');
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferView.buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bufferView.data, gl.STATIC_DRAW);
          } else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferView.buffer);
          }
        }
            
            

        gl.bindVertexArray(null);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);



            // material shader setup
        material = primitive.material;
        if (material) {
          if (material.pbrMetallicRoughness.baseColorTexture) {
            primitive.shader.defineMacro('HAS_BASECOLORMAP');
          }
          if (material.pbrMetallicRoughness.metallicRoughnessTexture) {
            primitive.shader.defineMacro('HAS_METALROUGHNESSMAP');
          }
          if (material.normalTexture) {
            primitive.shader.defineMacro('HAS_NORMALMAP');
          }
          if (material.occlusionTexture) {
            primitive.shader.defineMacro('HAS_OCCLUSIONMAP');
          }
          if (material.emissiveTexture) {
            primitive.shader.defineMacro('HAS_EMISSIVEMAP');
          }
        }
            

        primitive.shader.compile();

      }
        
    }


    return newGltfRuntimeScene;
  }

}