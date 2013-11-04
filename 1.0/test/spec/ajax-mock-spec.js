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
    });
}, {requires:['node', 'ajax',
    'test/json/demo'
]});