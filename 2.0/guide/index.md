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

##如何测试kissy的异步加载模块

有2种方法：
- 干掉异步加载过程，静态引用模块文件
-  异步加载完模块文件后，再执行jasmine运行测试用例

这里明河推荐使用第二种方法，虽然会麻烦些。

####引入runner.js

```html
  <script type="text/javascript" src="http://a.tbcdn.cn/s/kissy/gallery/jasmine-kissy/2.0/runner.js"></script>
```

####加载指定测试模块文件

```javascript
    KISSY.use('jasmine/runner',function(S,runner){
        runner('specs/ajax-mock-spec');
    })
```

如果你需要加载多个测试模块:

```javascript
    KISSY.use('jasmine/runner',function(S,runner){
        runner(['specs/ajax-mock-spec','specs/html-mock-spec']);
    })
```

 **留意：**  specs模块包，需要自己配置下，比如：

```javascript
    KISSY.use('jasmine/runner',function(S,runner){
        runner(['specs/ajax-mock-spec','specs/html-mock-spec'],{ name:'specs', path:'./', charset:"gbk" });
    })
```

####测试模块如何写？

```javascript
KISSY.add(function (S, Node, io, demo) {
    describe('runner test', function () {
        it('runner test', function () {

        });

    });
}, {requires:['node','page/mods/demo' ]});
```
describe包裹在add()内，然后requires源码模块js。

##ajax mock

jasmine-kissy中的ajax mock远比[jasmine ajax](https://github.com/pivotal/jasmine-ajax)来的强大。

- 你无需修改任何源码js
- 能够直接截获接口，当脚本向接口发送请求时，直接劫持到伪结果集
- 简单，根据status自动返回对应的结果集，你只需要书写一份伪数据
- 完美支持jsonp，无需任何标识
- 支持kissy的所有io方法，比如get()、post()、jsonp等

目前不支持mock io.upload()。

demo传送门：[mock api test](http://demo.36ria.com/jasmine-kissy/ajax_mock_spec_runner.html)


####引入依赖文件

想要mock kissy的ajax，需要覆盖"ajax/base"模块，所以不能引入kissy.js文件，只能引用seed-min.js，然后引入jasmine-kissy.js文件，比如下面的代码：

```html
  <script type="text/javascript" src="http://a.tbcdn.cn/s/kissy/1.2.0/??seed-min.js,dom-min.js,event-min.js,node-min.js"></script>
  <script type="text/javascript" src="http://a.tbcdn.cn/s/kissy/gallery/jasmine-kissy/1.0/jasmine-kissy.js"></script>
```

留意必须开启KISSY的debug标识：

```javascript
       var S = KISSY;
       S.Config.debug = '@DEBUG@';
```

####ajax的伪数据

```javascript
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
```

一份伪数据为一个数组，包含各种状态下的结果集，比如成功，失败，传入不同参数时。

- status：值为200时，为成功状态，会触发io的**sucess**事件
- data：为前端传递给服务器端的参数，对应io的**data**参数，当不存在匹配时，mock类会返回不带参数的结果集
- responseText：文本结果集，留意jsonp时的文本，mock类会自动判断jsonp

####mock 的使用

```javascript
        var api = "http://service.taobao.com/support/minerva/ajax/refundPlugAjax.htm";
        //使用mock
        io.useMock = true;
        //装入伪数据
        io.install(api, simpleData);
        //使用成功状态的假数据
        io.use(api, 200);
```

**io.useMock=true** 开启ajax mock

**io.install(api, simpleData)** 装入伪数据，simpleData即上面的demo数据

**io.use(api, 200)** 使用成功状态的伪数据

 接下来可以使用io方法试试

```javascript
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
```
onSuccess方法将会被执行一次，并且它的第一个参数的值为：

```javascript
{"status":1,"name":"minghe"}
```

如果你想要mock 接口失败时的情况

```javascript
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
```
mock jsonp的接口情况也是如此

```javascript
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
```
如果你想要mock，不同传参下的接口

 ```javascript
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
 ```

 所有的mock都非常简单，你无需修改源码js，mock类会自动处理，你唯一要做的就是install伪数据，然后use你想要的结果集

##velocity mock的使用

大多数业务逻辑的js测试都依赖于dom结构（采用mvc框架会好很多），velocity mock的功能是直接拉取工程中的vm文件，然后渲染出html片段，插入到body中。

[点击进入velocity mock的demo](http://demo.36ria.com/jasmine-kissy/velocity_mock_spec_runner.html)

####我们准备一个vm模版

list.vm内容如下:

 ```html
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
 ```

伪数据list.json内容如下：

 ```javascript
{
    "MAP":{
        "control":"./specs/vms"
    },
    "type":1,
    "currentProofMsg":[
        {"attachment":"http://img01.taobaocdn.com/imgextra/i1/10361016579368429/T1zbCTXfdmXXXXXXXX_!!413810361-0-tstar","roleName":"您","content":"这是一条留言"},
        {"attachment":"http://img01.taobaocdn.com/imgextra/i1/10361016579368429/T1zbCTXfdmXXXXXXXX_!!413810361-0-tstar","roleName":"您","content":"这是一条留言"}
    ]
}
  ```

MAP是特殊关键字，后面明河会解释。

####在spec文件中引入HtmlMock

```javascript
 KISSY.add(function (S, Node,HtmlMock) {
     var $ = Node.all;
     var htmlMock = new HtmlMock();
     describe('velocity mock test', function () {

     })
},{requires:['node','jasmine/htmlMock']});
```
####读取vm模版和伪数据

```javascript
 KISSY.add(function (S, Node,HtmlMock) {
     var $ = Node.all;
     var htmlMock = new HtmlMock();
     describe('velocity mock test', function () {
        it('正确读取并解析vm模版',function(){
            htmlMock.load('./specs/vms/list.vm','./specs/vms/list.json');

            expect($('.scroller')).toExist();
            expect($('.J_ListItem').length).toBe(2);
            expect($('.J_ImgDD').length).toBe(2);
        })
     })
},{requires:['node','jasmine/htmlMock']});
```

`load()`方法有二个参数：

- vm模版路径，必填
- 伪数据路径，可以直接传入json数据，比如下面的代码


```javascript
htmlMock.load('./specs/vms/list.vm',{
    "MAP":{
            "control":"./specs/vms"
        },
        "type":1,
        "currentProofMsg":[
            {"attachment":"http://img01.taobaocdn.com/imgextra/i1/10361016579368429/T1zbCTXfdmXXXXXXXX_!!413810361-0-tstar","roleName":"您","content":"这是一条留言"},
            {"attachment":"http://img01.taobaocdn.com/imgextra/i1/10361016579368429/T1zbCTXfdmXXXXXXXX_!!413810361-0-tstar","roleName":"您","content":"这是一条留言"}
        ]
});
```

####MAP的用途

MAP用于指定vm模版中依赖模版的路径，比如你的vm可能会出现`#parse("control/listImageComment.vm")`这样的引用，这时候就需要指定下`control`的路径映射。

####clean:清理模版

测试运行结束后建议clean下模版，避免影响其他测试的准确度。

`htmlMock.clean('./specs/vms/list.vm')` ，不填入第一个参数时，会清理所有的html片段，不推荐！！！

加载的html片段会放在页面的测试容器内，容器id为`#J_JF`。

加载的片段会放入缓存，避免重复加载。


## html mock的使用

[点此查看demo](http://demo.36ria.com/jasmine-kissy/html_mock_spec_runner.html)

html mock与velocity mock基本一样，更为简单，不需要第二个伪数据参数。

假设在你的`specs/fixtures`目录有个html片段文件`jasmine-kissy_fixture.html`。

文件的内容如下：
    <div id="test" class="test-wrapper">
        my name is minghe.
    </div>

使用如下语法加载这个文件：

    `htmlMock.load('./specs/jasmine-kissy_fixture.html');`

你可以测试下#test这个div是否存在：

    `expect('#test').toExist();`

(ps:toExist()是jasmine-kissy新增的macher，用于测试节点是否存在)


## KISSY matchers

[点此查看demo](http://demo.36ria.com/jasmine-kissy/matchers_spec_runner.html)

- `toExist()` 测试节点的存在性
- `toHasClass()` 测试节点是否拥有指定的class名
- `toHasAttr()` 测试节点是否拥有指定的属性值
- `toHasProp()` 测试节点是否拥有指定的property值
- `toHasData()` 测试节点是否拥有指定扩展属性值
- `toContain()` 测试节点是否有子节点
- `toEqualValue()` 测试节点的的value值
- `toEqualText()` 测试节点的text

示例代码：

  `expect($('#test')).toHasClass('test-wrapper');`

  `expect($('#test')).toEqualText('my name is minghe.');`

