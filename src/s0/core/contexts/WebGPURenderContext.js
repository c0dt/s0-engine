import RenderContext from "./RenderContext";

import ResourcePipeline from '../../../resources/ResourcePipeline';
const NumActiveUniformBuffers = 30;
export default class WebGPURenderContext extends RenderContext {
  static init(canvas) {
    if (!('WebGPURenderingContext' in window)) {
      return null;
    }
    canvas = canvas || document.querySelector("canvas");
    let context = canvas.getContext("webgpu");
    if (context === null) {
      console.warn('WebGPU is not supported');
      return null;
    } else {
      console.log("%c 😀WebGPU is available.", 'background: #222; color: #bada55');
      return new WebGPURenderContext(context, {
        canvasSize: {
          width: canvas.width,
          height: canvas.height,
        }
      });
    }
  }

  constructor(context, options) {
    super(context);
    this._viewport = {};
    this._commandQueue = context.createCommandQueue();

    let depthStencilDescriptor = new window.WebGPUDepthStencilDescriptor();
    depthStencilDescriptor.depthWriteEnabled = true;
    depthStencilDescriptor.depthCompareFunction = "less";
    this._depthStencilState = context.createDepthStencilState(depthStencilDescriptor);

    let depthTextureDescriptor = new window.WebGPUTextureDescriptor(context.PixelFormatDepth32Float, options.canvasSize.width, options.canvasSize.height, false);
    depthTextureDescriptor.textureType = context.TextureType2D;
    depthTextureDescriptor.sampleCount = 1;
    depthTextureDescriptor.usage = context.TextureUsageUnknown;
    depthTextureDescriptor.storageMode = context.StorageModePrivate;
    this._depthTextureDescriptor = depthTextureDescriptor;
    let depthTexture = context.createTexture(depthTextureDescriptor);

    this._renderPassDescriptor = new window.WebGPURenderPassDescriptor();
    this._renderPassDescriptor.colorAttachments[0].loadAction = context.LoadActionClear;
    this._renderPassDescriptor.colorAttachments[0].storeAction = context.StoreActionStore;
    this._renderPassDescriptor.colorAttachments[0].clearColor = [0.35, 0.35, 0.35, 1.0];
    this._renderPassDescriptor.depthAttachment.loadAction = context.LoadActionClear;
    this._renderPassDescriptor.depthAttachment.storeAction = context.StoreActionDontCare;
    this._renderPassDescriptor.depthAttachment.clearDepth = 1.0;
    this._renderPassDescriptor.depthAttachment.texture = depthTexture;

    this._currentUniformBufferIndex = 0;
    this._uniformBuffers = [];
    for (let i = 0; i < NumActiveUniformBuffers; i++) {
      this._uniformBuffers[i] = context.createBuffer(new Float32Array(16));
    }
  }

  setViewport(x, y, w, h) {
    this._viewport.x;
    this._viewport.y;
    this._viewport.width = w;
    this._viewport.height = h;
  }

  ///////////////
  getProgramLoader(options) {
    let metalURL = options.metalURL;
    return () => ResourcePipeline.loadAsync(
      `${metalURL}.metal`
    );
  }

  createProgram(source) {
    let gpu = this._context;
    let library = gpu.createLibrary(source);
    let vertexFunction = library.functionWithName("vertex_main");
    let fragmentFunction = library.functionWithName("fragment_main");
    let pipelineDescriptor = new window.WebGPURenderPipelineDescriptor();
    pipelineDescriptor.vertexFunction = vertexFunction;
    pipelineDescriptor.fragmentFunction = fragmentFunction;
    pipelineDescriptor.colorAttachments[0].pixelFormat = gpu.PixelFormatBGRA8Unorm;
    pipelineDescriptor.depthAttachmentPixelFormat = gpu.PixelFormatDepth32Float;

    let renderPipelineState = gpu.createRenderPipelineState(pipelineDescriptor);
    return renderPipelineState;
  }

  useProgram(program) {
    this._renderPipelineState = program;
  }

  beginRendering() {
    let context = this._context;
    this._commandBuffer = this._commandQueue.createCommandBuffer();
    this._drawable = context.nextDrawable();
    this._renderPassDescriptor.colorAttachments[0].texture = this._drawable.texture;
    this._commandEncoder = this._commandBuffer.createRenderCommandEncoderWithDescriptor(this._renderPassDescriptor);
    this._commandEncoder.setDepthStencilState(this._depthStencilState);
    this._commandEncoder.setRenderPipelineState(this._renderPipelineState);
  }

  endRendering() {
    this._commandEncoder.endEncoding();
    this._commandBuffer.presentDrawable(this._drawable);
    this._commandBuffer.commit();
  }

  prepare(primitive) {
    let context = this._context;
    let vertexBuffer = context.createBuffer(primitive.vertexData);
    return {
      vertexBuffer: vertexBuffer
    };
  }

  drawPrimitive(primitive, MVP) {
    let context = this._context;
    this._commandEncoder.setVertexBuffer(primitive.vertexBuffer, 0, 0);
    let currentUniformBufferIndex = this._currentUniformBufferIndex;
    let uniform = new Float32Array(this._uniformBuffers[currentUniformBufferIndex].contents);
    for (let i = 0; i < 16; i++) {
      uniform[i] = MVP[i];
    }
    this._commandEncoder.setVertexBuffer(this._uniformBuffers[currentUniformBufferIndex], 0, 1);
    this._commandEncoder.drawPrimitives(context.PrimitiveTypeTriangle, 0, 36);
    this._currentUniformBufferIndex = (this._currentUniformBufferIndex + 1) % NumActiveUniformBuffers;
  }
}