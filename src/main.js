import S0 from './S0';

export default class Main {
  constructor() {
    S0.initWith(document.createElement('canvas'));
  }
}

window.mainApp = new Main();