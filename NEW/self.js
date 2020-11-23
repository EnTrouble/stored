class Compiler {
    constructor(el, vm) {
        // 判断传进来的el是不是元素 如果不是元素  得自行获取
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        // console.log(this.el, '---this.el')
        // 把模板放到内存中进行编译 编译完以后再放回来
        let fragment = this.nodeToFragment(this.el);
        // 将表达式替换成真实的数据
        this.compile(fragment);
        // 把内容再塞到页面
        this.el.appendChild(fragment);
    }
    isElementNode(node) {
        return node.nodeType === 1;
    }
    isDirective(attr) {
        return attr.startsWith("v-");
    }
    compileElement(node) {
        // 编译元素
        let attributes = node.attributes;
        [...attributes].forEach((attr) => {
            // v-model = person.name
            const { name, value: expr } = attr;
            if (this.isDirective(name)) { //  v-model  v-html  v-bind
                // console.log(node, '----node')
                let [, directive] = name.split("-");
                // 需要调用不同的指令来处理
                compileUtil[directive](node, expr, this.vm);
            }
        })
    }
    compileText(node) {
        // 编译文本
        let textContent = node.textContent;
        if (/\{\{(.+?)\}\}/.test(textContent)) {
            compileUtil["text"](node, textContent, this.vm);
        }
    }
    compile(node) {
        // 编译内存中的文档碎片
        // 拿到文档碎片的子节点
        let childNodes = node.childNodes;
        [...childNodes].forEach((child) => {
            if (this.isElementNode(child)) {
                this.compileElement(child);
                this.compile(child);
            } else {
                this.compileText(child);
            }
        })
    }
    nodeToFragment(node) {
        // childNode只是儿子节点
        // 创建一个文档碎片
        let fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = node.firstChild) {
            // appendChild具有移动性
            fragment.appendChild(node.firstChild);
        }
        return fragment;
    }
}

compileUtil = {
    getVal(vm, expr) { // vm.$data "school.name" [person,name]
        return expr.split(".").reduce((data, current) => {
            // data是初始值 current是当前的数组item
            return data[current];
        }, vm.$data);
    },
    /**
     * 
     * @param {*} node 节点
     * @param {*} expr 表达式 person.name
     * @param {*} vm 
     */
    model(node, expr, vm) {
        let fn = this.updater["modelUpdate"];
        let value = this.getVal(vm, expr);
        fn(node, value);
    },
    text(node, expr, vm) {
        // expr: {{person.name}}
        let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return this.getVal(vm, args[1]);
        })
        let fn = this.updater['textUpdate'];
        fn(node, content);
    },
    updater: {
        modelUpdate(node, value) {
            node.value = value;
        },
        textUpdate(node, value) {
            node.textContent = value;
        }
    }
}
class Vue {
    constructor(options) {
        // this.$el this.$data
        this.$el = options.el;
        this.$data = options.data;
        // 存在根元素，编译模板
        if (this.$el) {
            new Compiler(this.$el, this)
        }
    }
}