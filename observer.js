function observer(data) {
    if (!data || typeof data !== 'object') {
        return;
    }
    // 取出所有属性遍历
    Object.keys(data).forEach(function(key) {
        defineReactive(data, key, data[key]);
    });
}

function defineReactive(data, key, val) {
    console.log("----为什么打印了两次")
    var dep = new Dep();
    observer(val); //监听子属性
    Object.defineProperty(data, key, {
        enumerable: true, // 可枚举
        configurable: false,
        get: function() {
            if (Dep.target) {
                dep.addSub(Dep.target); //在这里添加一个订阅者
            }
            return val;
        },
        set: function(newVal) {
            if (newVal == val) {
                return;
            }
            console.log('属性变化了 ', val, '---> ', newVal);
            val = newVal;
            dep.notify(); //告知订阅者
        }
    })
}

function Dep() {
    this.depArr = [];
}
Dep.prototype = {
    addSub: function(sub) {
        this.depArr.push(sub);
    },
    notify: function() {
        this.depArr.forEach(function(item) {
            item.update();
        });
    }
};