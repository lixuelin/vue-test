class Compiler {
    // el 宿主元素
    // vm KVue实例
    constructor(el, vm) {
        this.$vm = vm;

        this.$el = document.querySelector(el);

        this.compile(this.$el);
    }

    compile(el) {
        const childNodes = el.childNodes;
        Array.from(childNodes).forEach(node => {
            // 判断节点类型 
            if (this.isElement(node)) {
                // 元素 <div></div>
                this.compileElement(node)

            } else if (this.isInter(node)) {
                // 差值文本 {{xx}}
                this.compilerText(node)
            }

            this.compile(node)
        })
    }

    isElement(node) { // 节点验证
        return node.nodeType === 1
    }

    isInter(node) { // 验证文本信息 插值文本
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }

    // 编译插值文本
    compilerText(node) {
        this.update(node, RegExp.$1, "text")
    }

    // update 负责更新dom 同时创建watcher 实例在两者之间挂钩

    update(node, exp, dir) {
        // 首次初始化
        const updaterFn = this[dir + "Updater"]
        updaterFn && updaterFn(node, this.$vm[exp])
            // 更新
        new Watcher(this.$vm, exp, function(value) {
            updaterFn && updaterFn(node, value)
        })
    }

    textUpdater(node, value) {
        node.textContent = value
    }

    compileElement(node) {
        // 获取属性
        const nodeAttrs = node.attributes;
        Array.from(nodeAttrs).forEach(attr => {
            const attrName = attr.name
            const exp = attr.value;

            if (this.isDirective(attrName)) {
                // 获取指令
                const dir = attrName.substring(2);

                // 执行相应更新函数
                this[dir] && this[dir](node, exp)
            }
        })
    }

    isDirective(attr) {
        return attr.indexOf("k-") == 0;
    }

    text(node, exp) {
        this.update(node, exp, "text")
    }
}