import hljs from 'highlight.js/lib/highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);

import { select } from './util';
import { styler } from './html';

class Editor {
  constructor(selector, options = {}) {
    this.el = select(selector);
    this.init();
  }

  init() {
    this.initStyler();
    this.initStylerActions();
    this.initEditor();
  }

  initEditor() {
    this.el.contentEditable = 'true';
    const text = document.createElement('p');
    text.innerText = 'Type here';
    this.el.appendChild(text);
    this.el.addEventListener('focus', () => {
      this.styler.wrapper.classList.add('is-visiable');
      this.highlight();
    });
    
    window.addEventListener("keydown", (event) => {
      if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
      }

      switch (event.key) {
        case "Tab":
          this.excute('indent');
          break;
        case "Enter":
          this.breakLine(event);
          break;  
        default:
          return; // Quit when this doesn't handle the key event.
      }

      // Cancel the default action to avoid it being handled twice
      event.preventDefault();
    }, true);
  }

  initStyler() {
    this.styler = {};
    this.el.insertAdjacentHTML('beforebegin', styler);
    this.styler.wrapper = select('.styler');
    this.styler.formating = select('#formating');
    this.styler.size = select('#size');
    this.styler.color = select('#color');
    this.styler.bold = select('#bold');
    this.styler.italic = select('#italic');
    this.styler.underline = select('#underline');
    this.styler.strikeThrough = select('#strikeThrough');
    this.styler.justifyLeft = select('#justifyLeft');
    this.styler.justifyCenter = select('#justifyCenter');
    this.styler.justifyRight = select('#justifyRight');
    this.styler.justifyFull = select('#justifyFull');
    this.styler.addImage = select('#addImage');
  }

  breakLine(event) {
    let doxExec = false;

    try {
      doxExec = document.execCommand('insertBrOnReturn', false, true);
    }
    catch (error) {
      // IE throws an error if it does not recognize the command...
    }

    if (doxExec) return true;
    
    // Standard
    if (window.getSelection) {
      event.stopPropagation();

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const br = document.createElement('br');
      
      range.deleteContents();
      range.insertNode(br);
      range.setStartAfter(br);
      range.setEndAfter(br);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

      return false;
    }

    // IE
    else if ($.browser.msie) {
      event.preventDefault();

      let range = document.selection.createRange();
      range.pasteHTML('<BR><SPAN class="--IE-BR-HACK"></SPAN>');
      range.moveStart('character', 1);
      return false;
    }

    return true;
  }

  initStylerActions() {

    this.styler.formating.addEventListener('change', () => {
      const select = this.styler.formating;
      this.excute('formatblock', select[select.selectedIndex].value);
    });
    this.styler.size.addEventListener('change', () => {
      const select = this.styler.size;
      this.excute('fontsize', select[select.selectedIndex].value);
    });
    this.styler.color.addEventListener('input', () => this.excute('forecolor', this.styler.color.value))
    this.styler.bold.addEventListener('click', () => this.excute('bold'));
    this.styler.italic.addEventListener('click', () => this.excute('italic'));
    this.styler.underline.addEventListener('click', () => this.excute('underline'));
    this.styler.strikeThrough.addEventListener('click', () => this.excute('strikeThrough'));
    this.styler.justifyLeft.addEventListener('click', () => this.excute('justifyLeft'));
    this.styler.justifyCenter.addEventListener('click', () => this.excute('justifyCenter'));
    this.styler.justifyRight.addEventListener('click', () => this.excute('justifyRight'));
    this.styler.justifyFull.addEventListener('click', () => this.excute('justifyFull'));
    this.styler.addImage.addEventListener('change', () => this.insertImage());
  }

  excute(cmd, value) {
    document.execCommand(cmd, false, value);
    this.el.focus();
    this.updateStylerStates();
  }

  updateStylerStates() {
    Object.keys(this.styler).forEach((el) => {
      if (document.queryCommandState(String(el))) {
        this.styler[el].classList.add('is-active');
      } else {
        this.styler[el].classList.remove('is-active');
      }
    })
  }

  highlight() {
    const code = Array.from(this.el.querySelectorAll('pre'));

    code.forEach((block) => {
      hljs.highlightBlock(block);
    })
  }

  getSelectedPosition() {
    return window.getSelection().getRangeAt(0);
  }


  updateCursorPosition(range) {
    this.selection.removeAllRanges();
    this.selection.addRange(range);
  }

  updateStylerPositoin() {
    const selectedPosition = this.getSelectedPosition();
    const dummy = document.createElement('sapn');
    let dummyRect;

    selectedPosition.insertNode(dummy);
    dummyRect = dummy.getBoundingClientRect();
    dummy.parentNode.removeChild(dummy);
    this.styler.wrapper.style.top = `${dummyRect.top + window.scrollY - 80}px`;
    this.styler.wrapper.style.left = `${dummyRect.left}px`;
  }

  insertImage() {
    const file = this.styler.addImage.files[0];
    if (!file) return;
    const imageURL = URL.createObjectURL(file);
    const img = document.createElement('img');
    let selectedPosition;

    img.src = imageURL;
    img.classList.add('editor-image');
    selectedPosition = this.getSelectedPosition();
    selectedPosition.insertNode(img);
  }
}

export default Editor;