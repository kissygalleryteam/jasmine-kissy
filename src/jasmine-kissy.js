KISSY.add("ajax/base", function (S, JSON, Event, XhrObject) {

        var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
            rspace = /\s+/,
            rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
            mirror = function (s) {
                return s;
            },
            HTTP_PORT = 80,
            HTTPS_PORT = 443,
            rnoContent = /^(?:GET|HEAD)$/,
            curLocation,
            curLocationParts;


        try {
            curLocation = location.href;
        } catch (e) {
            S.log("ajax/base get curLocation error : ");
            S.log(e);
            // Use the href attribute of an A element
            // since IE will modify it given document.location
            curLocation = document.createElement("a");
            curLocation.href = "";
            curLocation = curLocation.href;
        }

        curLocationParts = rurl.exec(curLocation);

        var isLocal = rlocalProtocol.test(curLocationParts[1]),
            transports = {},
            defaultConfig = {
                // isLocal:isLocal,
                type:"GET",
                // only support utf-8 when post, encoding can not be changed actually
                contentType:"application/x-www-form-urlencoded; charset=UTF-8",
                async:true,
                // whether add []
                serializeArray:true,
                // whether param data
                processData:true,

                accepts:{
                    xml:"application/xml, text/xml",
                    html:"text/html",
                    text:"text/plain",
                    json:"application/json, text/javascript",
                    "*":"*/*"
                },
                converters:{
                    text:{
                        json:JSON.parse,
                        html:mirror,
                        text:mirror,
                        xml:S.parseXML
                    }
                },
                contents:{
                    xml:/xml/,
                    html:/html/,
                    json:/json/
                }
            };

        defaultConfig.converters.html = defaultConfig.converters.text;

        function setUpConfig(c) {
            // deep mix
            c = S.mix(S.clone(defaultConfig), c || {}, undefined, undefined, true);
            if (!S.isBoolean(c.crossDomain)) {
                var parts = rurl.exec(c.url.toLowerCase());
                c.crossDomain = !!( parts &&
                    ( parts[ 1 ] != curLocationParts[ 1 ] || parts[ 2 ] != curLocationParts[ 2 ] ||
                        ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? HTTP_PORT : HTTPS_PORT ) )
                            !=
                            ( curLocationParts[ 3 ] || ( curLocationParts[ 1 ] === "http:" ? HTTP_PORT : HTTPS_PORT ) ) )
                    );
            }

            if (c.processData && c.data && !S.isString(c.data)) {
                // ���� encodeURIComponent ���� utf-8
                c.data = S.param(c.data, undefined, undefined, c.serializeArray);
            }

            c.type = c.type.toUpperCase();
            c.hasContent = !rnoContent.test(c.type);

            if (!c.hasContent) {
                if (c.data) {
                    c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.data;
                }
                if (c.cache === false) {
                    c.url += ( /\?/.test(c.url) ? "&" : "?" ) + "_ksTS=" + (S.now() + "_" + S.guid());
                }
            }

            // �������ʹ�������һ������ǰ�����������ת�������һ��
            c.dataType = S.trim(c.dataType || "*").split(rspace);

            c.context = c.context || c;
            return c;
        }

        function fire(eventType, xhr) {
            io.fire(eventType, { ajaxConfig:xhr.config, xhr:xhr});
        }

        function handleXhrEvent(e) {
            var xhr = this,
                c = xhr.config,
                type = e.type;
            if (this.timeoutTimer) {
                clearTimeout(this.timeoutTimer);
            }
            if (c[type]) {
                c[type].call(c.context, xhr.responseData, xhr.statusText, xhr);
            }
            fire(type, xhr);
        }

        function io(c) {
            if (!c.url) {
                return undefined;
            }

            c = setUpConfig(c);
            var xhr = new XhrObject(c);
            fire("start", xhr);
            var transportContructor = transports[c.dataType[0]] || transports["*"],
                transport = new transportContructor(xhr);
            xhr.transport = transport;

            if (c.contentType) {
                xhr.setRequestHeader("Content-Type", c.contentType);
            }
            var dataType = c.dataType[0],
                accepts = c.accepts;
            // Set the Accepts header for the server, depending on the dataType
            xhr.setRequestHeader(
                "Accept",
                dataType && accepts[dataType] ?
                    accepts[ dataType ] + (dataType === "*" ? "" : ", */*; q=0.01"  ) :
                    accepts[ "*" ]
            );

            // Check for headers option
            for (var i in c.headers) {
                xhr.setRequestHeader(i, c.headers[ i ]);
            }

            xhr.on("complete success error", handleXhrEvent);

            xhr.readyState = 1;

            fire("send", xhr);

            // Timeout
            if (c.async && c.timeout > 0) {
                xhr.timeoutTimer = setTimeout(function () {
                    xhr.abort("timeout");
                }, c.timeout * 1000);
            }

            //add by ����
            var useMock = io.useMock;

            if (useMock) {
                mock(c, xhr);
            } else {
                try {
                    // flag as sending
                    xhr.state = 1;
                    transport.send();
                } catch (e) {
                    // Propagate exception as error if not done
                    if (xhr.status < 2) {
                        xhr.callback(-1, e);
                        // Simply rethrow otherwise
                    } else {
                        S.error(e);
                    }
                }
            }

            return xhr;
        }

        S.mix(io, Event.Target);
        S.mix(io, {
            isLocal:isLocal,
            setupConfig:function (setting) {
                S.mix(defaultConfig, setting, undefined, undefined, true);
            },
            setupTransport:function (name, fn) {
                transports[name] = fn;
            },
            getTransport:function (name) {
                return transports[name];
            },
            getConfig:function () {
                return defaultConfig;
            }
        });
        /**
         *  mock����
         * @param c
         * @param xhr
         */
        function mock(c, xhr) {
            var mockData = io.currentResponse;
            if (!c.data) c.data = "";
            var type = c.dataType;
            var isJsonp = S.isArray(type) && type[0] == 'script' && type[1] == 'json';
            mockData = io._getResponseUseData(mockData, c.data, isJsonp);
            xhr.status = mockData.status;
            xhr.responseText = mockData.responseText || "";
            xhr.mimeType = mockData.contentType;

            if (isJsonp) {
                io._setJsonpCallback(xhr, mockData);
            }
            //����ajax����Ļص�
            xhr.callback(mockData.status);

            io.resetCurrentResponse();
        }

        /**
         * mock ����
         * @author ����
         */
        S.mix(io, {
            /**
             * ��ǰʹ�õ�α����
             * @type Object | Array
             * @default []
             */
            currentResponse:[],
            /**
             * �Ƿ�mock ajax����
             * @type Boolean
             * @default false
             */
            useMock:false,
            /**
             * ����currentResponse
             * @return Array
             */
            resetCurrentResponse:function () {
                return io.currentResponse = [];
            },
            /**
             * ���mock��α����
             * @param {String} url ��Ҫmock�Ľӿ�
             * @param {Object} response ��������{status:200,responseText:''}
             */
            install:function (url, response) {
                if (!S.isString(url)) {
                    S.log('response��url�����ڣ�');
                    return false;
                }
                if (S.isArray(response)) {
                    var responses = io.responses;
                    S.each(response, function (res, i) {
                        //mock�ӿڷ��ص�����ͷ��Ϣ
                        response[i].contentType = res.responseHeaders || defaultConfig.accepts.json;
                    });
                    responses[url] = response;
                }
                return responses[url];
            },
            /**
             * ʹ��ָ��״̬�������
             * @param  {String} url
             * @param {Number|String} status
             */
            use:function (url, status) {
                if (!status || status == 'success') status = 200;

                var response = io.responses[url];
                if (!response) return false;

                return io.currentResponse = io._getResponse(response, status);
            },
            /**
             * �Ӵ��α���ݣ������ɹ�ʧ�ܣ���ȡָ��״̬���α����
             * @param {Object}  response
             * @param {Number} status
             * @return {Array}
             * @private
             */
            _getResponse:function (response, status) {
                if (!response) return false;

                var res = [];
                if (S.isNumber(status)) {
                    S.each(response, function (r) {
                        if (r.status == status) {
                            res.push(r);
                        }
                    });
                }

                return res;
            },
            /**
             *  ͨ���첽������������Ҫ�ļ�����
             * @param {Array} response
             * @param {String} data
             * @param {Boolean} isJsonp �Ƿ���jsonp
             * @private
             */
            _getResponseUseData:function (response, data, isJsonp) {
                var res = {};
                var oData = S.unparam(data);
                if (S.isEmptyObject(oData)) {
                    S.each(response, function (r) {
                        if (!r.data) {
                            if (isJsonp) {
                                if (io._isJsonpResponse(r)) {
                                    res = r;
                                    return false;
                                }
                            } else {
                                res = r;
                                return false;
                            }
                        }
                    })
                } else {
                    var hasData = false;
                    S.each(response, function (r) {
                        var str = S.param(r.data);
                        if (str == data) {
                            if (isJsonp) {
                                if (io._isJsonpResponse(r)) {
                                    res = r;
                                    hasData = true;
                                    return false;
                                }
                            } else {
                                res = r;
                                hasData = true;
                                return false;
                            }
                        }
                    });
                    if (!hasData) return io._getResponseUseData(response, '');
                }
                return res;
            },
            /**
             * �Ƿ���jsonp�Ľ����
             * @param {Object} response �������
             * @return {Boolean}
             * @private
             */
            _isJsonpResponse:function (response) {
                var responseText = response.responseText;
                return /\(/.test(responseText);
            },
            /**
             * ��ȡjsonp�ص�������
             * @param {Object} response
             * @private
             * @return {String}
             */
            _getJsonpCallbackName:function (response) {
                var responseText = response.responseText;
                return responseText.split('(')[0];
            },
            /**
             * mock jsonp�Ļص�
             * @param {Object} xhr xhr����
             * @param {Object} response �����
             * @private
             */
            _setJsonpCallback:function (xhr, response) {
                var callbackName = io._getJsonpCallbackName(response);
                //���ûص�����
                window[callbackName] = function (r) {
                    // jsonp ����������
                    if (arguments.length > 1) {
                        r = S.makeArray(arguments);
                    }
                    xhr.responseData = r;
                    xhr.fire('success');
                };

                xhr.jsonpCallback = callbackName;
            },
            /**
             * ���������
             * @type Object
             * @default {}
             */
            responses:{}
        });
        return io;
    },
    {
        requires:["json", "event", "ajax/xhrobject"]
    });

KISSY.add('jasmine/htmlMock',function(S,Node,io,Velocity){
    var $ = Node.all;

    /**
     * @name JamineFixture
     * @class ����jasmine����ǰ��ҳ���������õ�htmlƬ�Σ�Ӧ����jsTestDriver��
     * @constructor
     */
    function JamineFixture(config) {
        var self = this;
        S.mix(self, JamineFixture.defaultConfig, config);
    }

    JamineFixture.defaultConfig = {
        /**
         * ��������
         */
        wrapperHook:'#J_JF',
        /**
         * htmlƬ�β���dom������id
         */
        wrapperTpl:'<div id ="J_JF"></div>',
        /**
         * ���ݻ���
         */
        cache:{},
        domCache:{}
    };
    S.augment(JamineFixture, {
        /**
         * ajax��ȡhtml�ļ��������뵽��������
         * @param {String} url htmlƬ�Σ�ģ�棩·��
         * @param {Object} mockData α����
         * @return {NodeList}
         */
        load:function (url,mockData) {
            var self = this, html;
            if (!arguments) return false;
            html = self._getHtml(url,mockData);
            return self._appendTo(url,html);
        },
        /**
         * ������������ڵĽڵ�
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
         * ajax��ȡ����html�ļ�
         * @param {String} url html�ļ���url
         * @param {String} mockData α���ݣ�ֻ����vmģ��ʱ����Ҫ��
         * @return {String}
         */
        _getHtml:function (url,mockData) {
            var self = this, cache = self.cache;
            //�����ڸ�htmlƬ�εĻ��棬ajax����
            if (S.isUndefined(cache[url])) {
                var html = self._send(url);

                //�Ƿ���vmģ��
                var isVm = self.isVm(url);
                if(isVm){
                    html = self._parse(html,mockData);
                    self.cache[url] = html;
                }
            }
            return self.cache[url];
        },
        /**
         *  ��������
         * @param url
         */
        _send:function(url,dataType){
            var self = this;
            var useMock = io.useMock;
            //�ȹر�ajax mock
            if(useMock){
                io.useMock = false;
            }
            var result = '';
            if(self.cache[url]) return self.cache[url];
            io( {
                //async��������Ϊfalse��ͬ�������ļ�������jasmine�Ĳ����п������ڻ�ȡ�ļ�֮ǰִ�е��²���ʧ��
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

            //���¿���ajax mock
            if(useMock){
                io.useMock = true;
            }
            self.cache[url] = result;
            return result;
        },
        /**
         * ��ҳ�����htmlƬ��dom
         * @param {string} html htmlƬ��
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
         * ������
         */
        cleanCache:function () {
            this.cache = {};
            return this;
        },
        /**
         * α����Ϊvmģ��
         * @param {String} url ·��
         * @return {Boolean}
         */
        isVm:function(url){
            return /\.vm$/.test(url);
        },
        /**
         *  ����ģ��
         * @param {String} tpl ģ��
         * @param {Object} data α����
         * @return {String}
         * @private
         */
        _parse:function(tpl,data){
            var self = this;
            if(!S.isString(tpl)) return '';

            //Ϊα����·�����ٷ��������ȡ֮
            if(S.isString(data)){
                data = self._send(data,'json');
            }

            tpl = self._require(tpl,data);
            //TODO:����velocity�����bug����ֹ���ز����ڵ��ļ�
            var Parser;
            S.use('gallery/velocity/1.0/parse',function(S,P){
                Parser = P;
            });
            var asts = Parser.parse(tpl);
            var compile = new Velocity(asts);
            return compile.render(data);
        },
        /**
         * ����ģ���ڵ���ģ��
         * @param {String} tpl ģ��
         * @param {Object} mockData α����
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
            //·��ӳ��
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
             * ��ȡģ���ڵ���ģ��
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
                        //���罫"controlת����mapָ����·��"
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
},{requires:['node','ajax','gallery/velocity/1.0/index']});

beforeEach(function () {
    var S = KISSY;
    var $ = S.Node.all;
    //����µ�matcher
    this.addMatchers({
        toExist:function () {
            return $(this.actual).length > 0;
        },
        toHasClass:function (className) {
            return $(this.actual).hasClass(className);
        },
        toHasAttr:function (attr) {
            return $(this.actual).hasAttr(attr);
        },
        toHasProp:function (prop) {
            return $(this.actual).hasProp(prop);
        },
        toHasData:function (dataName) {
            return $(this.actual).data(dataName) != '';
        },
        toContain:function (selector) {
            return $(this.actual).children(selector).length > 0;
        },
        toEqualValue:function (value) {
            return $(this.actual).val() === value;
        },
        toEqualText:function (text) {
            return KISSY.trim($(this.actual).text()) === text;
        },
        toShow:function () {
            return $(this.actual).css('display') === 'block';
        }
    });
});