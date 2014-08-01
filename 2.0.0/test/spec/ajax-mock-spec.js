KISSY.add(function (S, Node, io, simpleData) {
    describe('kissy ajax mock api test', function () {
        var onSuccess, onError;
        var api = "http://service.taobao.com/support/minerva/ajax/refundPlugAjax.htm";
        //使用mock
        io.useMock = true;
        //装入伪数据
        io.install(api, simpleData);

        it('use success data mock', function () {
            //使用成功状态的假数据
            io.use(api, 200);
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
        });

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

        it('use success data mock with data',function(){
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
        });

        it('use success data mock with data,but dont have data',function(){
            //参数不存在时，使用没有参数的成功状态伪数据
            io.use(api,200);

            onSuccess = jasmine.createSpy('onSuccess');
            //异步请求带上不存在的参数
            S.io({
                url:api,
                type:"GET",
                data:{test:'null'},
                success:function (data, status) {
                    onSuccess(data);
                }
            });
            var successResult = onSuccess.mostRecentCall.args[0];
            expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
            expect(successResult.status).toEqual(1);
            expect(successResult.name).toEqual('minghe');
        })

        it('io.get() mock',function(){
            io.use(api,200);

            onSuccess = jasmine.createSpy('onSuccess');
            //异步请求带上不存在的参数
            S.io.get(api,function(data){
                onSuccess(data);
            });
            var successResult = onSuccess.mostRecentCall.args[0];
            expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
            expect(successResult.status).toEqual(1);
            expect(successResult.name).toEqual('minghe');
        })

        it('io.post() mock',function(){
            io.use(api,200);

            onSuccess = jasmine.createSpy('onSuccess');
            //异步请求带上不存在的参数
            S.io.post(api,function(data){
                onSuccess(data);
            });
            var successResult = onSuccess.mostRecentCall.args[0];
            expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
            expect(successResult.status).toEqual(1);
            expect(successResult.name).toEqual('minghe');
        })
        it('then()',function(){
            io.use(api,200);

            onSuccess = jasmine.createSpy('onSuccess');
            //异步请求带上不存在的参数
            S.io.get(api).then(function(data){
                onSuccess(data);
            });
            var successResult = onSuccess.mostRecentCall.args[0][0];
            expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
            expect(successResult.status).toEqual(1);
            expect(successResult.name).toEqual('minghe');
        })
        it('io.jsonp() mock',function(){
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
        })
        it('io.jsonp() mock with data',function(){
            io.use(api,200);

            onSuccess = jasmine.createSpy('onSuccess');
            //异步请求带上不存在的参数
            S.io.jsonp(api,{site:'36ria'},function(data){
                onSuccess(data);
            });
            var successResult = onSuccess.mostRecentCall.args[0];
            expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
            expect(successResult.status).toEqual(2);
            expect(successResult.site).toEqual('36ria');
        })
    });
}, {requires:['node', 'ajax',
    'test/json/demo'
]});