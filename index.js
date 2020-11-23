function SelfVue(data, el, exp) {
    console.log("SelfVue -> data", data)
    this.data = data;
    console.log("SelfVue -> this", this)
    observer(data);
    el.innerHTML = this.data[exp];
    new watcher(this, exp, function(value) {
        el.innerHTML = value;
    })
    return this;
}