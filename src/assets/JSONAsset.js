import Asset from './Asset';

export default class JSONAsset extends Asset{
    
  loadAsync() {
    return new Promise((resolve, reject)=>{
      let xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', this._url, true);
      xobj.onreadystatechange = () => {
        if (xobj.readyState === 4 && 
            xobj.status === 200) {
          resolve(xobj.responseText);
        }
      };
      xobj.send(null);
    });
  }
}