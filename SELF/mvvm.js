// 对数据进行劫持
class Observer {
    constructor(data) {

    }
}

class Compiler {
    constructor(el, vm) {
            this.el = this.isElementNode(el) ? el : document.querySelector(el);
            this.vm = vm;
            // 放到内存里
            let fragment = this.nodeToFragment(this.el);
            // 编译
            this.compile(fragment);
            // 渲染到页面上
            this.el.appendChild(fragment);
        }
        // 是否是元素节点
    isElementNode(node) {
        return node.nodeType === 1
    }
    isDirective(name) {
            return name.startsWith("v-");
        }
        // 编译元素
    compileElement(node) {
            let attributes = node.attributes;
            [...attributes].forEach((attr) => { //v-html
                // name: type|v-model  value: text|person.name
                let { name, value: expr } = attr;
                if (this.isDirective(name)) {
                    let [, directive] = name.split("-");
                    compileUtil[directive](node, expr, this.vm);
                }
            })
        }
        // 编译文本
    compileText(node) {
        let textContent = node.textContent;
        if (/\{\{(.+?)\}\}/.test(textContent)) {
            compileUtil["text"](node, textContent, this.vm);
        }
    }
    compile(node) {
            let childNodes = node.childNodes;
            childNodes.forEach((child) => {
                if (this.isElementNode(child)) {
                    this.compileElement(child);
                    this.compile(child);
                } else {
                    this.compileText(child);
                }
            })
        }
        // 放到内存里
    nodeToFragment(node) {
        let fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = node.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
}

let compileUtil = {
    getVal(vm, expr) { //person.name
        // vm.$data[person.name]
        return expr.split(".").reduce((data, currentValue) => {
            return data[currentValue];
        }, vm.$data)
    },
    /**
     * 
     * @param {*} node 节点
     * @param {*} expr 表达式（person.name）
     * @param {*} vm 实例
     */
    model(node, expr, vm) {
        let fn = this.updater["modelUpdater"];
        let value = this.getVal(vm, expr);
        fn(node, value);
        // node.value = XXX
    },
    html() {},
    text(node, expr, vm) {
        let fn = this.updater["textUpdater"];
        let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return args[1];
        });
        let value = this.getVal(vm, content);
        fn(node, value);
    },
    updater: {
        modelUpdater(node, value) {
            node.value = value;
        },
        textUpdater(node, value) {
            node.textContent = value;
        }
    }
}
class Vue {
    constructor(options) {
        // this.$el this.$data
        this.$el = options.el;
        this.$data = options.data;
        if (this.$el) {
            new Observer(this.$data);
            new Compiler(this.$el, this);
        }
    }
}