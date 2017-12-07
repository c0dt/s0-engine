export default class ResourceItem {  
  constructor({ url, type }) {
    this._url = url;
    if (type) {
      this._type = type;
    } else {
      let matches = url.match(/\.(\w{3,})($|\?)/);
      if (matches && matches.length === 3) {
        this._type = matches[1].toLowerCase();
      }
    }
  }

  get type() {
    return this._type;
  }
  
  get url() {
    return this._url;
  }
}