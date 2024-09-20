import BinaryLoader from './BinaryLoader';
import Buffer from '../../core/Buffer';
import BufferView from '../../core/BufferView';
import Accessor from '../../core/Accessor';
import ResourcePipeline from '../ResourcePipeline';

/**
 * 
 * uint32 magic
    uint32 version
    uint32 length
 */
export default class VRMLoader extends BinaryLoader {

    private jsonObject : any = {}

    private vrmRawData : ArrayBuffer = new ArrayBuffer(0);

    private _processBuffers(glTF:any, context:any) {
        if (glTF.buffers) {
          context.buffers = glTF.buffers.map((buffer:{byteLength:number}) => {
            const {byteLength} = buffer;
            return new Buffer({
              byteLength,
              uri:""
            }, this.vrmRawData)
          });
        }
      }

    private _processBufferViews(glTF:any, context:any) {
      let bufferViews:any[] = [];
      if (glTF.bufferViews) {
        bufferViews = glTF.bufferViews.map((bufferView:any) => {
          bufferView.buffer = context.buffers[bufferView.buffer];
          return new BufferView(bufferView);
        });
      }
      context.bufferViews = bufferViews;
      return context;
    }

    private _processAccessors(glTF:any, context:any) {
      let accessors:any[] = [];
      if (glTF.accessors) {
        accessors = glTF.accessors.map((accessor:any) => {
          accessor.bufferView = context.bufferViews[accessor.bufferView];
          return new Accessor(accessor);
        });
      }
      context.accessors = accessors;
      return context;
    }
    async _processImages(glTF:any, context:any) {
      if (glTF.images) {
        let options:any[] = [];

        options = glTF.images.map((image:{name:string, bufferView:number, mimeType:string}) => {
          const {name, bufferView, mimeType} = image;
          const bufferViewObj:BufferView = context.bufferViews[bufferView];
          const blob = new Blob( [ bufferViewObj.data ], { type: mimeType } );
          const url = URL.createObjectURL( blob );
          return { name: name, url: url, type: "png" };
        });
        let images = await ResourcePipeline.loadAllAsyncForceType(options);
        context.images = images;
        options.forEach(option=>{
          URL.revokeObjectURL(option.url);
        });
        return context;
      } else {
        return Promise.resolve(context);
      }
    }
    async _decode(rawData:any) : Promise<any> {
        console.log(new Buffer(this.item, rawData));
        let view:DataView = new DataView(rawData);
        let offset:number = 0;
        const magic:number = view.getUint32(0, true);
        offset+=4;
        const version:number = view.getUint32(offset, true)
        offset+=4;
        const length:number = view.getUint32(offset, true);

        if(magic === 0x46546C67)
        {
            console.log("Magic OK, version = " + version)
        }

        console.log(`total length = ${length}`);
        offset+=4;
        var chunkLength = view.getUint32(offset, true);
        offset+=4;
        var chunkType = view.getUint32(offset, true);
        offset+=4;
        console.log(chunkType === 0x4E4F534A);
        let utf8decoder = new TextDecoder(); 
        this.jsonObject = JSON.parse(utf8decoder.decode(new DataView(rawData, offset, chunkLength)));
        console.log(`chunkLength 1 length = ${chunkLength}`);
        offset += chunkLength;
        chunkLength = view.getUint32(offset, true);
        offset+=4;
        chunkType = view.getUint32(offset, true);
        offset+=4;
        console.log(chunkType === 0x004E4942);
        console.log(chunkLength);
        console.log(`chunkLength 2 length = ${chunkLength}`);
        console.log(`offset = ${offset}`);
        this.vrmRawData = rawData.slice(offset, chunkLength+offset);
        console.log(this.vrmRawData);
        console.log(this.jsonObject);
        let glTF = this.jsonObject;
        console.log(glTF);
        let context = {
          buffers: undefined,
          bufferViews: undefined,
          accessors: undefined,
          meshes: undefined,
          images:undefined,
          textures: undefined,
          rootNode: undefined,
          animations: undefined
        };
    
        let promises = [];
        this._processBuffers(glTF, context);
        this._processBufferViews(glTF, context);
        this._processAccessors(glTF, context);
        await this._processImages(glTF, context);
        // promises.push(this._processBuffers(glTF, context));
        console.log(context);
        return null;
    }
}