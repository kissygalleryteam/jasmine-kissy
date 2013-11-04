KISSY.add(function(S,Node,io,Velocity,Parser){
    var $ = Node.all;

    /**
     * @name JamineFixture
     * @class 用于jasmine测试前向页面插入测试用的html片段（应用于jsTestDriver）
     * @constructor
     */
    function JamineFixture(config) {
        var self = this;
        S.mix(self, JamineFixture.defaultConfig, config);
    }

    JamineFixture.defaultConfig = {
        /**
         * 容器钩子
         */
        wrapperHook:'#J_JF',
        /**
         * html片段插入dom的容器id
         */
        wrapperTpl:'<div id ="J_JF"></div>',
        /**
         * 数据缓存
         */
        cache:{},
        domCache:{}
    };
    S.augment(JamineFixture, {
        /**
         * ajax读取html文件，并插入到测试容器
         * @param {String} url html片段（模版）路径
         * @param {Object} mockData 伪数据
         * @return {NodeList}
         */
        load:function (url,mockData) {
            var self = this, html;
            if (!arguments) return false;
            html = self._getHtml(url,mockData);
            return self._appendTo(url,html);
        },
        /**
         * 清除测试容器内的节点
         * @param {String} url
         */
        clean:function (url) {
            var self = this;
            if(url){
                var $el = self.domCache[url];
                if($el && $el.length) $el.remove();
            }else{
                var wrapperHook = self.wrapperHook;
                $(wrapperHook).html('');
            }
        },
        /**
         * ajax读取单个html文件
         * @param {String} url html文件的url
         * @param {String} mockData 伪数据（只有是vm模块时才需要）
         * @return {String}
         */
        _getHtml:function (url,mockData) {
            var self = this, cache = self.cache;
            //不存在该html片段的缓存，ajax请求
            if (S.isUndefined(cache[url])) {
                var html = self._send(url);

                //是否是vm模版
                var isVm = self.isVm(url);
                if(isVm){
                    html = self._parse(html,mockData);
                    self.cache[url] = html;
                }
            }
            return self.cache[url];
        },
        /**
         *  发送请求
         * @param url
         */
        _send:function(url,dataType){
            var self = this;
            var useMock = io.useMock;
            //先关闭ajax mock
            if(useMock){
                io.useMock = false;
            }
            var result = '';
            if(self.cache[url]) return self.cache[url];
            io( {
                //async必须设置为false，同步加载文件，否则jasmine的测试有可能是在获取文件之前执行导致测试失败
                async:false,
                cache:false,
                dataType: dataType || 'html',
                //contentType:"application/x-www-form-urlencoded; charset=gbk",
                //mimeType:"",
                url:url,
                data:{},
                success:function (data) {
                    result = data;
                },
                error:function (xhr, status, errorThrown) {
                    throw Error('Fixture could not be loaded: ' + url + ' (status: ' + status + ', message: ' + errorThrown.message + ')');
                }
            });

            //重新开启ajax mock
            if(useMock){
                io.useMock = true;
            }
            self.cache[url] = result;
            return result;
        },
        /**
         * 向页面添加html片段dom
         * @param {string} html html片段
         */
        _appendTo:function (url,html) {
            if (!S.isString(html)) return false;
            var self = this, wrapperTpl = self.wrapperTpl,
                wrapperHook = self.wrapperHook ;
            if(!$(wrapperHook).length){
                $('body').append(wrapperTpl);
            }

            var $html = $(html);
            self.domCache[url] = $html;
            $(wrapperHook).append($html);
            return $(wrapperHook);
        },
        /**
         * 清理缓存
         */
        cleanCache:function () {
            this.cache = {};
            return this;
        },
        /**
         * 伪数据为vm模版
         * @param {String} url 路径
         * @return {Boolean}
         */
        isVm:function(url){
            return /\.vm$/.test(url);
        },
        /**
         *  解析模版
         * @param {String} tpl 模版
         * @param {Object} data 伪数据
         * @return {String}
         * @private
         */
        _parse:function(tpl,data){
            var self = this;
            if(!S.isString(tpl)) return '';

            //为伪数据路径，再发个请求获取之
            if(S.isString(data)){
                data = self._send(data,'json');
            }

            tpl = self._require(tpl,data);
            //TODO:这是velocity组件的bug，防止加载不存在的文件
            var asts = Parser.parse(tpl);
            var compile = new Velocity(asts);
            return compile.render(data);
        },
        /**
         * 加载模版内的子模版
         * @param {String} tpl 模版
         * @param {Object} mockData 伪数据
         * @return {String}
         * @private
         */
        _require:function(tpl,mockData){
            var self = this;
            var reg = /#parse\(\"(.*)\"\)/g;
            var parseMods = tpl.match(reg) || [];
            var reg2 = /\$control.setTemplate\(\"(.*)\"\).*\r\n/g;
            var parseMods2 = tpl.match(reg2) || [];
            var isHasMods = parseMods.length || parseMods2.length;
            if(!isHasMods || !mockData['MAP']) return tpl;
            if(parseMods2.length){
                S.each(parseMods2,function(controlMod){
                    parseMods.push(controlMod);
                })
            }
            //路径映射
            var map = mockData['MAP'];
            S.each(parseMods,function(parseMod){
                var isMatche = parseMod.match(reg) || [];
                if(!isMatche.length){
                    reg = reg2;
                    isMatche = parseMod.match(reg) || [];
                }
                var mod = RegExp.$1;
                if(!self.cache[mod]){
                    var html = _loadMod(mod);
                    tpl = tpl.replace(parseMod,html);
                }
            });

            return tpl;

            /**
             * 读取模版内的子模版
             * @param mod
             * @return {String}
             * @private
             */
            function _loadMod(mod){
                var html = '';
                var path = '';
                S.each(map,function(path,namespace){
                    var reg = new RegExp(namespace);
                    if(reg.test(mod)){
                        //比如将"control转换成map指定的路径"
                        path = mod.replace(reg,path);
                        html = self._send(path);
                        self.cache[mod] = html;
                        return false;
                    }
                });
                return html;
            }
        }
    });

    return JamineFixture;
},{requires:['node','ajax','gallery/velocity/1.1/index','gallery/velocity/1.1/parse']});