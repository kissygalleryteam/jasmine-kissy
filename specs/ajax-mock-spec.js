KISSY.add(function (S, Node, io, simpleData) {
    describe('kissy ajax mock api test', function () {
        var onSuccess, onError;
        var api = "http://service.taobao.com/support/minerva/ajax/refundPlugAjax.htm";
        //ʹ��mock
        io.useMock = true;
        //װ��α����
        io.install(api, simpleData);

        it('use success data mock', function () {
            //ʹ�óɹ�״̬�ļ�����
            io.use(api, 200);
            // ����ajax�Ļص�����
            onSuccess = jasmine.createSpy('onSuccess');
            //�����첽����
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
            //ʹ��ʧ��״̬�ļ�����
            io.use(api,500);

            onError = jasmine.createSpy('onError');

            //�����첽����
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
            //�첽�������ָ������
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
            //����������ʱ��ʹ��û�в����ĳɹ�״̬α����
            io.use(api,200);

            onSuccess = jasmine.createSpy('onSuccess');
            //�첽������ϲ����ڵĲ���
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
            //�첽������ϲ����ڵĲ���
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
            //�첽������ϲ����ڵĲ���
            S.io.post(api,function(data){
                onSuccess(data);
            });
            var successResult = onSuccess.mostRecentCall.args[0];
            expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
            expect(successResult.status).toEqual(1);
            expect(successResult.name).toEqual('minghe');
        })

        it('io.jsonp() mock',function(){
            io.use(api,200);

            onSuccess = jasmine.createSpy('onSuccess');
            //�첽������ϲ����ڵĲ���
            S.io.jsonp(api,function(data){
                onSuccess(data);
            });
            var successResult = onSuccess.mostRecentCall.args[0];
            expect(onSuccess).toHaveBeenCalledWith(jasmine.any(Object));
            expect(successResult.status).toEqual(1);
            expect(successResult.name).toEqual('minghe');


        })
    });
}, {requires:['node', 'ajax',
    'specs/datas/simple'
]});