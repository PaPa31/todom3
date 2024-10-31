// state-controller.js

class StateController {
  constructor(protocol) {
    this.protocol = protocol || window.location.protocol;
  }

  getProtocol() {
    return this.protocol;
  }

  // Другие методы управления состояниями...
}
