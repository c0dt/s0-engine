import GLTFBufferLoader from './GLTFBufferLoader';
import Buffer from '../../core/Buffer';
/**
 * 
 * uint32 magic
    uint32 version
    uint32 length
 */
export default class VRMLoader extends GLTFBufferLoader {

    private jsonObject : any = {}

    private _processBuffers(glTF:any, context:any) {
        if (glTF.buffers) {
        //   let urls = [];
        //   let path = this.url.substr(0, this.url.lastIndexOf('/'));
        //   glTF.buffers.forEach((buffer) => {
        //     urls.push(path + '/' + buffer.uri);
        //   });
        //   return ResourcePipeline.loadAllAsync(urls).then((dataList) => {
        //     context.buffers = dataList;
        //     return context;
        //   });
            console.log(glTF.buffers);
        } else {
          return Promise.resolve(context);
        }
      }

    private _processBufferViews(glTF:any, context:any) {
      // let bufferViews = [];
      // if (glTF.bufferViews) {
      //   glTF.bufferViews.forEach((bufferView) => {
      //     bufferView.buffer = context.buffers[bufferView.buffer];
      //     bufferViews.push(new BufferView(bufferView));
      //   });
      // }
      // context.bufferViews = bufferViews;
      return context;
    }

    async _decode(rawData:any) : Promise<Buffer> {
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
        console.log(length);
        offset+=4;
        var chunkLength = view.getUint32(offset, true);
        offset+=4;
        var chunkType = view.getUint32(offset, true);
        offset+=4;
        console.log(chunkType === 0x4E4F534A);
        let utf8decoder = new TextDecoder(); 
        this.jsonObject = JSON.parse(utf8decoder.decode(new DataView(rawData, offset, chunkLength)));
        offset+=chunkLength;
        chunkLength = view.getUint32(offset, true);
        offset+=4;
        chunkType = view.getUint32(offset, true);
        offset+=4;
        console.log(chunkType === 0x004E4942);
        console.log(chunkLength);
        console.log(this.jsonObject);
        let glTF = this.jsonObject;
        console.log(glTF);
        let context = {
          buffers: undefined,
          bufferViews: undefined,
          accessors: undefined,
          meshes: undefined,
          textures: undefined,
          rootNode: undefined,
          animations: undefined
        };
    
        let promises = [];
        this._processBuffers(glTF, context);
        this._processBufferViews(glTF, context);
        // promises.push(this._processImages(glTF, context));
        // promises.push(this._processBuffers(glTF, context));
        return new Buffer(this.item, rawData);
    }
}