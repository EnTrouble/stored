class Conpiler {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;
    // 把当前节点中的元素放到内存中
    let fragment = this.nodeToFragment(this.el);
    // 把节点的内容进行替换

    // 编译模板  用数据编译
    this.compile(fragment);
    this.el.appendChild(fragment);
  }
  compile (fragment) {
    // 用来编译内存中的dom节点
    let childNodes = fragment.childNodes;
    [...childNodes].forEach((child) => {
      if (this.isElementNode(child)) {
        // console.log(child, '---element')
        this.compileElement(child);
        this.compile(child);
      } else {
        this.compileText(child);
        // console.log(child, '---text')
      }
    })
  }
  isDirective (attrName) {
    return attrName.startsWith("v-");
  }
  compileElement (node) {
    let attributes = node.attributes;
    [...attributes].forEach((attr) => {
      const { name, value: expr } = attr; //v-model = "schoool.msg"
      if (this.isDirective(name)) { //v-model v-bind
        const [, directive] = name.split("-");
        CompileUtil[directive](node, expr, this.vm)
      }
    })
  }
  compileText (node) {
    // 判断当前节点内容是否含有{{aaa}}{{bbb}}
    let textContent = node.textContent;
    if (/\{\{(.+?)\}\}/.test(textContent)) {
      CompileUtil["text"](node, textContent, this.vm)
    }
  }
  nodeToFragment (node) {
    let fragment = document.createDocumentFragment();
    let firstChild;
    while (firstChild = node.firstChild) {
      fragment.appendChild(firstChild);
    }
    return fragment;
  }
  isElementNode (node) {
    return node.nodeType === 1;
  }
}

CompileUtil = {
  getValue (vm, expr) {//vm.data schoo.msg
    return expr.split(".").reduce((data, current) => {
      return data[current];
    }, vm.$data);
  },
  model (node, expr, vm) {//node是节点 expr是school.msg 
    // 给输入框赋值  node.value
    let fn = this.updater["modelUpdater"]
    let value = this.getValue(vm, expr)
    fn(node, value)
  },
  text (node, expr, vm) {
    let fn = this.updater["textUpdater"];
    let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.getValue(vm, args[1]);
    });
    fn(node, content);
  },
  updater: {
    modelUpdater (node, value) {
      node.value = value;
    },
    textUpdater (node, value) {
      node.textContent = value;
    }
  }
}

// 基类 调度
class Mvvm {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    if (this.$el) {
      new Conpiler(this.$el, this);
    }
  }
} 