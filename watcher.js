function watcher(vm, exp, cb) {
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.value = this.get(); // 将自己添加到订阅器的操作
}

watcher.prototype = {
    update: function() {
        this.run();
    },
    run: function() {
        var value = this.vm.data(this.exp);
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    },
    get: function() {
        Dep.target = this;
        var value = this.vm.data[this.exp]; //强行执行监听器里的get函数
        Dep.target = null;
        return value;
    }

}