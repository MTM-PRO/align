import { isElementClosest, updatePosition } from './partial/util';
import Selection from './selection';

export default class Prompt {
  constructor (align, {
    message = '',
    data = '',
    position = null,
    inputsCount = 1,
    inputsPlaceholders = []
  } = {}) {
    this.settings = {
      position,
      inputsCount,
      inputsPlaceholders
    };
    this.$align = align;
    this._init(message, data);
  }

  _init (message, data) {
    const position = this.settings.position;
    this.el = document.createElement('div');
    this.message = document.createElement('label');
    this.inputs = [];
    this.buttons = {};

    this.el.classList.add('prompt');
    this.message.classList.add('prompt-message');

    if (position) {
      this.el.style.left = `${position.left}px`;
      this.el.style.top = `${position.top}px`;
    }
    if (!position) {
      if (Selection.range.startContainer.nodeType === 3) {
        this.selectionReference = Selection.range;
      }
      if (Selection.range.startContainer.nodeType === 1) {
        this.selectionReference = Selection.range.startContainer;
      }
      setTimeout(() => {
        updatePosition(this.selectionReference, this.el, this.$align.el, 'left-top');
      }, 1);
    }
    this.message.innerText = message;

    this.el.appendChild(this.message);
    for (let i = 0; i < this.settings.inputsCount; i++) {
      this.inputs[i] = document.createElement('input');
      this.inputs[i].classList.add('prompt-input');
      if (this.settings.inputsPlaceholders[i]) {
        this.inputs[i].placeholder = this.settings.inputsPlaceholders[i];
      }
      this.el.appendChild(this.inputs[i]);
    }

    this.inputs[0].value = data;

    this.$align.el.appendChild(this.el);
    this.callbackFunc = (event) => {
      if (isElementClosest(event.target, this.el)) {
        return;
      }
      this.remove();
    };
    setTimeout(() => {
      document.addEventListener('click', this.callbackFunc);
    }, 1);
  }

  on (name, func, args) {
    this.buttons[name] = document.createElement('button');
    this.buttons[name].classList.add('prompt-button');
    this.buttons[name].innerText = name;
    this.buttons[name].addEventListener('click', () => {
      func(args);
      this.remove();
    });
    this.el.appendChild(this.buttons[name]);
    return this;
  }

  onSubmit (func, args) {
    return this.on('submit', func, args);
  }

  onDelete (func, args) {
    return this.on('delete', func, args);
  }

  onCancel (func, args) {
    return this.on('cancel', func, args);
  }

  remove () {
    this.el.remove();
    document.removeEventListener('click', this.callbackFunc);
  }
}
