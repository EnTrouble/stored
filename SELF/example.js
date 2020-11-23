// 数据变化--->模板要重新编译

// 存放观察者
class Dep {
    constructor() {
            this.subs = []
        }
        // 订阅
    addSub(watcher) {
        this.subs.push(watcher);
    }
    notify() {
        this.subs.forEach((watcher) => {
            watcher.update();
        })
    }
}
// 观察者  被观察者
class Watcher {
    constructor(vm, expr, type, cb) {
        this.vm = vm;
        this.expr = expr;
        this.type = type;
        this.cb = cb;
        // 只有旧值与新值不同时才更新
        this.oldValue = this.getValue();
    }
    getValue() {
        Dep.target = this;
        let value = compileUtil.getVal(this.vm, this.expr);
        Dep.target = null;
        return value;
    }
    update() {
        let newValue = compileUtil.getVal(this.vm, this.expr);
        if (newValue != this.oldValue) {
            this.cb(newValue);
        }
    }
}
// 数据改版 ---> 模板也发生变化
class Observer {
    constructor(data) {
        this.observer(data);
    }
    observer(data) {
        if (data && typeof data === "object") {
            for (const key in data) {
                this.defineReactive(data, key, data[key])
            }
        }
    }
    defineReactive(obj, key, value) {
        this.observer(value);
        let dep = new Dep();
        console.log("Observer -> defineReactive -> dep", dep)
        Object.defineProperty(obj, key, {
            get() {
                if (Dep.target) {
                    dep.addSub(Dep.target);
                }
                return value;
            },
            set(newVal) {
                if (value != newVal) {
                    value = newVal;
                    dep.notify();
                }
            }
        })
    }
}

class Compiler {
    constructor(el, vm) {
            this.el = this.isElementNode(el) ? el : document.querySelector(el);
            this.vm = vm;
            // 放到内存中
            let fragment = this.nodeToFragment(this.el);
            // 将表达式替换成数据
            this.compile(fragment);
            // 放回去
            this.el.appendChild(fragment);
        }
        // 判断是不是元素
    isElementNode(node) {
        return node.nodeType === 1;
    }
    isDirective(name) {
            return name.startsWith("v-");
        }
        // 编译元素
    compileElement(node) {
            let attributes = node.attributes;
            [...attributes].forEach((attr) => {
                // name:type|v-model|class   value:text|person.name|uuul
                let { name, value: expr } = attr;
                if (this.isDirective(name)) { //v-model  v-html
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
        [...childNodes].forEach((child) => {
            // 元素的属性  文本的内容
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
    getVal(vm, expr) {
        // person.name   vm.$data[person.name]
        return expr.split(".").reduce((obj, currentValue) => {
            return obj[currentValue];
        }, vm.$data);
    },
    setValue(vm, expr, value) { //[person,name]
        expr.split(".").reduce((obj, currentValue, index, arr) => {
            if (index == arr.length - 1) {
                obj[currentValue] = value;
            }
            return obj[currentValue];
        }, vm.$data);
    },
    /**
     * 
     * @param {*} node 元素
     * @param {*} expr 表达式person.name
     * @param {*} vm 实例
     */
    // vm.$watch(vm,"person.name",(newVal)=>{

    // })
    model(node, expr, vm) {
        let fn = this.updater["modelUpdate"];
        new Watcher(vm, expr, "model", (newVal) => {
            fn(node, newVal);
        })
        node.addEventListener("input", (e) => {
            let inputValue = e.target.value;
            this.setValue(vm, expr, inputValue);
        })
        let value = this.getVal(vm, expr);
        fn(node, value);
    },
    text(node, expr, vm) {
        let fn = this.updater["textUpdate"];
        let content = expr.replace(/\{\{(.+?)\}\}/, (...args) => {
            return args[1];
        })
        new Watcher(vm, content, "text", (newVal) => {
            fn(node, newVal);
        })
        let value = this.getVal(vm, content);
        fn(node, value);
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
        // 拿到模板  替换表达式  渲染到页面上
        if (this.$el) {
            new Observer(this.$data);
            new Compiler(this.$el, this);
        }
    }
}