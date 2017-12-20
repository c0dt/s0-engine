export default class ResourceItem {  
  constructor({ name, url, type }) {
    this._name = name;
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

  get name() {
    return this._name;
  }

  get type() {
    return this._type;
  }
  
  get url() {
    return this._url;
  }
}