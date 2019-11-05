// 数据的响应化
// 数据编译 依赖收集

// new KVue({data: {}})

class KVue {
    constructor(options) {
        this.$options = options;
        this.$data = options.data;
        this.observe(this.$data);

        new Compiler(options.el, this);

        // 执行created函数
        if (options.created) {
            options.created.call(this)
        }
    }

    observe(value) {
        // 遍历必须是对象
        if (!value || typeof value !== "object") {
            return;
        }

        // 遍历
        Object.keys(value).forEach(key => {
            // 真正响应化处理
            this.defineReactive(value, key, value[key]);

            // 代理data中的属性到vue实例上
            this.proxyData(key)
        })

    }

    defineReactive(obj, key, val) {

        // 递归调用检测数据是否为对象
        this.observe(val);

        // 创建Dep实例
        const dep = new Dep();

        // 闭包形成
        Object.defineProperty(obj, key, {
            get() {
                Dep.target && dep.addDep(Dep.target);
                return val;
            },
            set(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                // 通知更新
                dep.notify()
            }
        })
    }

    proxyData(key) {
        // this为kvue的实例， 进行属性的转化
        Object.defineProperty(this, key, {
            get() {
                return this.$data[key];
            },
            set(newVal) {
                this.$data[key] = newVal;
            }
        })
    }
}

// Dep 主要用来和data中的每一个key对应起来，主要负责管理相关watcher

class Dep {
    constructor() {
        this.deps = []
    }

    addDep(dep) {
        this.deps.push(dep)
    }

    notify() {
        this.deps.forEach(dep => dep.update())
    }
}


// watcher 负责创建data中key和更新函数的映射关系

class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm;
        this.key = key;
        this.cb = cb;
        Dep.target = this; // 把当前watcher实例附加到Dep静态属性上；
        this.vm[this.key];
        Dep.target = null;
    }

    update() {
        console.log(`${this.key}属性更新了`);
        this.cb.call(this.vm, this.vm[this.key])
    }
}