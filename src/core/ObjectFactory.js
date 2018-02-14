import * as components from '../components';

class ObjectFactory {
  constructor() {
        
  }

  get(name, attributes) {
    return components[name];
  }
}

export default new ObjectFactory;