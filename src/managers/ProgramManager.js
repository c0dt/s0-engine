export default class ProgramManager {

  constructor(context) {
    this._context = context;
    this._programs = {};
  }

  load(name, options) {
    let loader = this._context.getProgramLoader(options);
    return loader().then((result) => {
      let program = this._context.createProgram(result);
      this._programs[name] = program;
      return name;
    });
  }

  use(name) {
    let program = this._programs[name];
    if (program) {
      this._context.useProgram(program);
    }
  }
}