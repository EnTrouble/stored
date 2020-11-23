class Conpiler {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    console.log(this.el)
  }
  isElementNode (node) {
    return node.nodeType === 1;
  }
}

// 基类 调度
class Vue {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    if (this.$el) {
      new Conpiler(this.$el, this);
    }
  }
} 