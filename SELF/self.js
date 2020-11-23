// 基类  用来调度其它方法
class Compiler {
    constructor(el, vm) {
            // 获取整个模板
            this.el = this.isElementNode(el) ? el : document.querySelector(el);
            this.vm = vm;
            // 将模板放到内存中进行编译  编译完以后 再将整体渲染到页面上
            // 1.将模板放到内存中
            let fragment = this.nodeToFragment(this.el);
            // 2.对模板进行编译 将表达式替换成真实的数据
            this.compile(fragment);
            // 3.渲染到页面上
            this.el.appendChild(fragment);
        }
        // 判断是否是元素节点
    isElementNode(node) {
            return node.nodeType === 1;
        }
        // 编译元素
    isDirective(attr) {
        return attr.startsWith("v-");
    }
    compileElement(element) {
            let attributes = element.attributes;
            [...attributes].forEach((attr) => {
                let { name, value: expr } = attr;
                // name:v-model  value:person.name
                if (this.isDirective(name)) {
                    let [, directive] = name.split("-");
                    compileUtil[directive](element, expr, this.vm);
                    console.log(element, directive, "element----")
                }
            })
        }
        // 编译文本
    compileText(node) {
        let content = node.textContent;
        if (/\{\{(.+?)\}\}/.test(content)) {
            compileUtil["text"](node, content, this.vm);
        }
    }
    compile(node) {
        let childs = node.childNodes;
        [...childs].forEach((child) => {
            if (this.isElementNode(child)) {
                this.compileElement(child);
                this.compile(child);
            } else {
                this.compileText(child);
            }
        })
    }
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
    getVal(expr, vm) { // person.name   
        return expr.split(".").reduce((obj, currentValue) => {
            console.log("getVal -> obj[currentValue]", obj[currentValue])
            return obj[currentValue];
        }, vm.$data);
    },
    /**
     * 
     * @param {*} node 当前节点
     * @param {*} expr 表达式  person.name
     * @param {*} vm 
     */
    model(node, expr, vm) {
        let fn = this.updater["modelUpdater"];
        let value = this.getVal(expr, vm);
        fn(node, value);
    },
    html() {},
    text(node, expr, vm) {
        let fn = this.updater["textUpdater"];
        let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return args[1];
        })
        let value = this.getVal(content, vm);
        fn(node, value);
    },
    updater: {
        modelUpdater(node, value) {
            node.value = value
        },
        textUpdater(node, value) {
            node.textContent = value;
        }
    }
}
class Vue {
    constructor(options) {
        // this.$data  this.$el
        this.$data = options.data;
        this.$el = options.el;
        if (this.$el) {
            new Observer();
            // 开始编译
            new Compiler(this.$el, this)
        }
    }
}