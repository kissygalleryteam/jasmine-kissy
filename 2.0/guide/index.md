## 综述

jasmine-kissy是为了方便基于kissy的代码进行单元测试，而向[Jasmine](http://pivotal.github.com/jasmine/)添加的扩展。

* 版本：2.0
* 作者：明河
* demo：[http://gallery.kissyui.com/jasmine-kissy/2.0/demo/index.html](http://gallery.kissyui.com/jasmine-kissy/2.0/demo/index.html)

jasmine-kissy主要扩展了如下四个功能

- 1.增加kissy的ajax mock功能（伪造ajax的假数据方便进行ajax测试）
- 2.增加velocity mock功能，直接读取vm模版，使用伪数据mock出测试所依赖的html片段（dom）
- 3.增加html mock功能，同步加载html片段并插入到测试运行页中
- 4.增加用于KISSY的machers，只作用于KISSY的Node模块

##测试代码的组织

####动态源码模块的加载处理

有2种方法：
- 干掉异步加载过程，静态引用模块文件
- 异步加载完模块文件后，再执行jasmine运行测试用例

这里明河推荐使用第二种方法，虽然会麻烦些。

所有的测试代码都放在test目录下。

![test](http://www.36ria.com/wp-content/uploads/2013/11/test.png)

####测试入口文件runner.html

    <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <title>Runner</title>
            <link type="text/css" rel="stylesheet" charset="utf-8" href="http://assets.spmjs.org/totoro/jasmine/1.3.1/jasmine.css" />
            <script src="http://assets.spmjs.org/totoro/jasmine/1.3.1/jasmine.js"></script>
            <script src="http://assets.spmjs.org/totoro/jasmine/1.3.1/jasmine-html.js"></script>
            <script src="//g.tbcdn.cn/kissy/k/1.3.1/seed.js"></script>
            <script src="http://a.tbcdn.cn/s/kissy/gallery/??velocity/1.1/index-min.js,jasmine-kissy/2.0/ajax-base-min.js"></script>
        </head>
        <body>
            <script>
                (function() {
                    var S = KISSY;
                    S.config({
                        packages:[
                            {
                                name:"test",
                                path:'./',
                                ignorePackageNameInUri:true
                            }
                        ]
                    });
                    var jasmineEnv = jasmine.getEnv();
                    jasmineEnv.updateInterval = 1000;
                    var htmlReporter = new jasmine.HtmlReporter();
                    jasmineEnv.addReporter(htmlReporter);

                    S.use('gallery/jasmine-kissy/2.0/',function(S,HtmlMock){
                        S.htmlMock = new HtmlMock();
                        S.use('test/runner',function(){
                            jasmineEnv.execute();
                        })
                    })
                })()
            </script>
        </body>
    </html>

核心代码如下：

    S.use('gallery/jasmine-kissy/2.0/',function(S,HtmlMock){
        S.htmlMock = new HtmlMock();
        S.use('test/runner',function(){
            jasmineEnv.execute();
        })
    })

####加载指定测试模块文件runner.js

    KISSY.add(function(){

    },{requires:['test/spec/html-mock-spec','test/spec/ajax-mock-spec','test/spec/velocity-mock-spec','test/spec/matchers-spec']})

requires指定测试用例文件。


####测试模块如何写？

以test/spec/html-mock-spec.js为例

    KISSY.add(function (S, Node) {
        var $ = Node.all;
        var htmlMock = S.htmlMock;
        describe('test fixture', function () {
            var url1 = './fixture/jasmine-kissy_fixture.html';
            it('成功读取html片段文件', function () {
                htmlMock.load(url1);
                expect($('#test')).toExist();
                expect(htmlMock.cache[url1]).not.toBeUndefined();
            });
            it('清理缓存和html片段', function () {
                htmlMock.clean();
                htmlMock.cleanCache();
                expect($('#test')).not.toExist();
                expect(htmlMock.cache[url1]).toBeUndefined();
            });
        });

    },{requires:['node']});

describe包裹在add()内，然后requires源码模块js。

##ajax mock

jasmine-kissy中的ajax mock远比[jasmine ajax](https://github.com/pivotal/jasmine-ajax)来的强大。

- 你无需修改任何源码js
- 能够直接截获接口，当脚本向接口发送请求时，直接劫持到伪结果集
- 简单，根据status自动返回对应的结果集，你只需要书写一份伪数据
- 完美支持jsonp，无需任何标识
- 支持kissy的所有io方法，比如get()、post()、jsonp等

目前不支持mock io.upload()。


####引入依赖文件

想要mock kissy的ajax，需要覆盖"ajax/base"模块，所以不能引入kissy.js文件，只能引用seed-min.js，然后引入ajax-base-min.js文件，比如下面的代码：

    <script src="http://a.tbcdn.cn/s/kissy/gallery/??velocity/1.1/index-min.js,jasmine-kissy/2.0/ajax-base-min.js"></script>


####ajax的伪数据

    KISSY.add(function (S) {
        return [
            {
                status:200,
                responseText: '{"status":1,"name":"minghe"}'
            },
            {
                status:500,
                responseText:''
            },
            {
                status:200,
                data:{site:'36ria'},
                responseText: '{"status":2,"site":"36ria"}'
            },
            {
                status:200,
                responseText: 'jsonp1234({"status":1,"name":"minghe"})'
            },
            {
                status:200,
                data:{site:'36ria'},
                responseText: 'jsonp5454({"status":2,"site":"36ria"})'
            }
        ]
    });

一份伪数据为一个数组，包含各种状态下的结果集，比如成功，失败，传入不同参数时。

- status：值为200时，为成功状态，会触发io的**sucess**事件
- data：为前端传递给服务器端的参数，对应io的**data**参数，当不存在匹配时，mock类会返回不带参数的结果集
- responseText：文本结果集，留意jsonp时的文本，mock类会自动判断jsonp

####mock 的使用

        var api = "http://service.taobao.com/support/minerva/ajax/refundPlugAjax.htm";
        //使用mock
        io.useMock = true;
        //装入伪数据
        io.install(api, simpleData);
        //使用成功状态的假数据
        io.use(api, 200);

**io.useMock=true** 开启ajax mock

**io.install(api, simpleData)** 装入伪数据，simpleData即上面的demo数据

**io.use(api, 200)** 使用成功状态的伪数据

 接下来可以使用io方法试试

            // 用于ajax的回调测试
            onSuccess = jasmine.createSpy('onSuccess');
            //触发异步请求
            S.io({
                url:api,
                type:"GET",
                success:function (data, status) {
                    onSuccess(data);
                }
            });

            var successResult = onSuccess.mostRecentCall.args[0];
            expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
            expect(successResult.status).toEqual(1);
            expect(successResult.name).toEqual('minghe');

onSuccess方法将会被执行一次，并且它的第一个参数的值为：

    {"status":1,"name":"minghe"}

如果你想要mock 接口失败时的情况

        it('use error data mock',function(){
            //使用失败状态的假数据
            io.use(api,500);

            onError = jasmine.createSpy('onError');

            //触发异步请求
            S.io({
                url:api,
                type:"GET",
                error:function(data){
                    onError(data);
                }
            });

            expect(onError).toHaveBeenCalled();
        });

mock jsonp的接口情况也是如此

            io.use(api,200);

            onSuccess = jasmine.createSpy('onSuccess');
            //异步请求带上不存在的参数
            S.io.jsonp(api,function(data){
                onSuccess(data);
            });
            var successResult = onSuccess.mostRecentCall.args[0];
            expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
            expect(successResult.status).toEqual(1);
            expect(successResult.name).toEqual('minghe');

如果你想要mock，不同传参下的接口

            io.use(api,200);

            onSuccess = jasmine.createSpy('onSuccess');
            //异步请求带上指定参数
            S.io({
                url:api,
                type:"GET",
                data:{site:'36ria'},
                success:function (data, status) {
                    onSuccess(data);
                }
            });
            var successResult = onSuccess.mostRecentCall.args[0];
            expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
            expect(successResult.status).toEqual(2);
            expect(successResult.site).toEqual('36ria');

 所有的mock都非常简单，你无需修改源码js，mock类会自动处理，你唯一要做的就是install伪数据，然后use你想要的结果集

##velocity mock的使用

大多数业务逻辑的js测试都依赖于dom结构（采用mvc框架会好很多），velocity mock的功能是直接拉取工程中的vm文件，然后渲染出html片段，插入到body中。


####我们准备一个vm模版

list.vm内容如下:

    <div class="scroller">
        <div class="ks-switchable-content">
            #foreach($msg in $!currentProofMsg)
            <div class="list-item J_ListItem">
                #if($!msg.attachment)
                #set($newUrl ="$!msg.attachment"+"_120x120.jpg")
                #set($originalUrl="$!msg.attachment"+".jpg")
                <img class="J_ImgDD" data-original-url="$refundImageServer.getURI("refund/$originalUrl")" src="$refundImageServer.getURI("refund/$newUrl")"/>
                #end
                <div class="image-comment">
                    <img class="comment-icon" src="http://img02.taobaocdn.com/tps/i2/T1yhMcXbBdXXb38KzX-15-13.png"/>
                    <div class=" J_ImageCommentContent">
                        <p class="comment-author">$!roleName的留言：</p>
                        <p>$!msg.content</p>
                    </div>
                </div>
            </div>
            #end
        </div>
    </div>

伪数据list.json内容如下：

    {
        "MAP":{
            "control":"./vm"
        },
        "type":1,
        "currentProofMsg":[
            {"attachment":"http://img01.taobaocdn.com/imgextra/i1/10361016579368429/T1zbCTXfdmXXXXXXXX_!!413810361-0-tstar","roleName":"您","content":"这是一条留言"},
            {"attachment":"http://img01.taobaocdn.com/imgextra/i1/10361016579368429/T1zbCTXfdmXXXXXXXX_!!413810361-0-tstar","roleName":"您","content":"这是一条留言"}
        ]
    }

MAP是特殊关键字，后面明河会解释。

####在spec文件中引入HtmlMock

    KISSY.add(function (S, Node) {
        var $ = Node.all;
        var htmlMock = S.htmlMock;
        describe('velocity mock test', function () {
            it('正确读取并解析vm模版',function(){
                htmlMock.load('./vm/list.vm','./vm/list.json');
                expect($('.scroller')).toExist();
                expect($('.J_ListItem').length).toBe(2);
                expect($('.J_ImgDD').length).toBe(2);
            })
            it('清理掉伪的html片段',function(){
                htmlMock.clean();
                expect($('.scroller')).not.toExist();
            })
        });

    },{requires:['node']});


`load()`方法有二个参数：

- vm模版路径，必填
- 伪数据路径，可以直接传入json数据，比如下面的代码


    htmlMock.load('./vm/list.vm',{
        "MAP":{
                "control":"./vm"
            },
            "type":1,
            "currentProofMsg":[
                {"attachment":"http://img01.taobaocdn.com/imgextra/i1/10361016579368429/T1zbCTXfdmXXXXXXXX_!!413810361-0-tstar","roleName":"您","content":"这是一条留言"},
                {"attachment":"http://img01.taobaocdn.com/imgextra/i1/10361016579368429/T1zbCTXfdmXXXXXXXX_!!413810361-0-tstar","roleName":"您","content":"这是一条留言"}
            ]
    });

####MAP的用途

MAP用于指定vm模版中依赖模版的路径，比如你的vm可能会出现`#parse("control/listImageComment.vm")`这样的引用，这时候就需要指定下`control`的路径映射。

####clean:清理模版

测试运行结束后建议clean下模版，避免影响其他测试的准确度。

`htmlMock.clean('./vm/list.vm')` ，不填入第一个参数时，会清理所有的html片段，不推荐！！！

加载的html片段会放在页面的测试容器内，容器id为`#J_JF`。

加载的片段会放入缓存，避免重复加载。


##html mock的使用


html mock与velocity mock基本一样，更为简单，不需要第二个伪数据参数。

假设在你的`test/fixture`目录有个html片段文件`jasmine-kissy_fixture.html`。

文件的内容如下：

    <div id="test" class="test-wrapper">
        my name is minghe.
    </div>

使用如下语法加载这个文件：

    htmlMock.load('./specs/jasmine-kissy_fixture.html');

你可以测试下#test这个div是否存在：

    expect('#test').toExist();

(ps:toExist()是jasmine-kissy新增的macher，用于测试节点是否存在)


## KISSY matchers


- `toExist()` 测试节点的存在性
- `toHasClass()` 测试节点是否拥有指定的class名
- `toHasAttr()` 测试节点是否拥有指定的属性值
- `toHasProp()` 测试节点是否拥有指定的property值
- `toHasData()` 测试节点是否拥有指定扩展属性值
- `toContain()` 测试节点是否有子节点
- `toEqualValue()` 测试节点的的value值
- `toEqualText()` 测试节点的text

示例代码：

  expect($('#test')).toHasClass('test-wrapper');

  expect($('#test')).toEqualText('my name is minghe.');

