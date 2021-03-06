import "object.observe";
import hyperx from 'hyperx';
import vdom from 'virtual-dom';
window.hx = hyperx(vdom.h);

class View {
	/**
	 * [constructor description]
	 * @param  {Object} option [description]
	 * @return {[type]}        [description]
	 */
    constructor(opts = {}) {
        const that = this;
        this.options = {
            events: null,
            listen: null,
            config: {}
        };
        Object.assign(this.options, opts);
        this.Eventer = Lego.Eventer;
        this._setElement(this.options.el);
        this.server = null;
        this.isloaded = false;  //是否已加载过
        this._renderRootNode();
        this.setElement(this.options.el);
        this.options.data = this.options.data || {};
        this._observe();
        if(this.options.dataSource){
            const dataSource = this.options.dataSource;
            if(dataSource.server){
                if(typeof dataSource.server == 'function'){
                    this.server = new dataSource.server();
                }else{
                    this.server = dataSource.server;
                }
                this.server.fetch(dataSource.api, (resp) => {
                    this.options.data = resp;
                    this.refresh();
                });
            }
        }else{
            this._renderComponents();
        }
    }
    /**
     * [_renderRootNode description]
     * @return {[type]} [description]
     */
    _renderRootNode(){
        const content = this.render();
        this.oldNode = content;
        this.rootNode = vdom.create(content);
        this.$el = $(this.rootNode);
        this.$el.attr('view-id', this.options.vid);
        if(this.options.style){
            this.$el.css(this.options.style);
        }
        if(this.options.attr){
            this.$el.attr(this.options.attr);
        }
        if(!this.options.el || this.options.el == 'body'){
            this._$el.html(this.$el);
        }else{
            this._$el.replaceWith(this.$el);
        }
        this.el = this.$el[0];
    }
    /**
     * [_renderComponents 渲染组件]
     * @return {[type]} [description]
     */
    _renderComponents(){
        const that = this;
        if(this.options.components){
            if(this.options.components.length && !this.isloaded) {
                this.isloaded = true;
                this.options.components.forEach(function(item, i){
                    const tagName = item.el ? that.$(item.el)[0].tagName : '';
                    if(tagName) Lego.create(Lego.UI[tagName.toLowerCase()], item);
                });
            }
        }
    }
    /**
     * [_observe 监听数据变化并刷新视图]
     * @return {[type]} [description]
     */
    _observe(){
        const that = this;
        if(this.options && typeof this.options === 'object'){
            Object.observe(this.options, (changes) =>{
                // debug.log(changes);
                const newNode = this.render();
                let patches = vdom.diff(that.oldNode, newNode);
                that.rootNode = vdom.patch(that.rootNode, patches);
                that.oldNode = newNode;
                that._renderComponents();
            });
        }
    }
    /**
     * [setElement description]
     * @param {[type]} element [description]
     */
    setElement(element) {
        this.unEvents();
        this._setElement(element);
        this.delegateEvents();
        return this;
    }
    /**
     * [_setElement description]
     * @param {[type]} el [description]
     */
    _setElement(el){
        el = el || Lego.config.pageEl;
        this._$el = el instanceof window.$ ? el : window.$(el);
    }
    /**
     * [delegateEvents description]
     * @return {[type]} [description]
     */
    delegateEvents() {
        const events = this.options.events;
        const delegateEventSplitter = /^(\S+)\s*(.*)$/;
        if (!events) return this;
        this.unEvents();
        for (let key in events) {
            let method = events[key];
            if (typeof method !== 'function') method = this[method];
            if (!method) continue;
            let match = key.match(delegateEventSplitter);
            this.delegate(match[1], match[2], method.bind(this));
        }
        return this;
    }
    /**
     * [delegate description]
     * @param  {[type]} eventName [description]
     * @param  {[type]} selector  [description]
     * @param  {[type]} listener  [description]
     * @return {[type]}           [description]
     */
    delegate(eventName, selector, listener) {
        this.$el.on(eventName + '.delegateEvents' + this.options.vid, selector, listener);
        return this;
    }
    /**
     * [unEvents description]
     * @return {[type]} [description]
     */
    unEvents() {
        if (this.$el) this.$el.off('.delegateEvents' + this.options.vid);
        return this;
    }
    /**
     * [undelegate description]
     * @param  {[type]} eventName [description]
     * @param  {[type]} selector  [description]
     * @param  {[type]} listener  [description]
     * @return {[type]}           [description]
     */
    undelegate(eventName, selector, listener) {
        this.$el.off(eventName + '.delegateEvents' + this.options.vid, selector, listener);
        return this;
    }
    /**
     * [$ description]
     * @param  {[type]} selector [description]
     * @return {[type]}          [description]
     */
    $(selector) {
        return this.$el.find(selector);
    }
    /**
     * render 渲染视图
     * @return {[type]} [description]
     */
    render() {
        return '';
    }
    /**
     * [refresh 刷新视图]
     * @return {[type]} [description]
     */
    refresh() {
        this.options.__v = Lego.randomKey();
    }
    /**
     * [remove 销毁视图]
     * @return {[type]} [description]
     */
    remove(){
        this.unEvents();
        Lego.views[Lego.getAppName()].delete(this.el);
        this.$el.remove();
    }
}
export default View;