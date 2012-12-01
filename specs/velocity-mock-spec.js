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
        it('清理掉伪的html片段',function(){
            htmlMock.clean();

            expect($('.scroller')).not.toExist();
        })

        it('从缓存中拉取html片段',function(){
            var html = htmlMock.cache['./specs/vms/list.vm'];
            expect(html).not.toBeUndefined();
        })

        it('清理缓存',function(){
            htmlMock.cleanCache();
            var html = htmlMock.cache['./specs/vms/list.vm'];
            expect(html).toBeUndefined();

        })


        it('如果vm模版内带有子模板时的处理',function(){
            htmlMock.load('./specs/vms/complexList.vm','./specs/vms/list.json');

            expect($('.scroller')).toExist();
            expect($('.J_ListItem').length).toBe(2);
            expect($('.J_ImgDD').length).toBe(2);

            htmlMock.clean();
        })

        it('直接传入伪数据的情况',function(){
            htmlMock.load('./specs/vms/complexList.vm',{
                "MAP":{
                    "control":"./specs/vms"
                },
                "currentProofMsg":[
                    {"attachment":"http://img01.taobaocdn.com/imgextra/i1/10361016579368429/T1zbCTXfdmXXXXXXXX_!!413810361-0-tstar","roleName":"您","content":"这是一条留言"},
                    {"attachment":"http://img01.taobaocdn.com/imgextra/i1/10361016579368429/T1zbCTXfdmXXXXXXXX_!!413810361-0-tstar","roleName":"您","content":"这是一条留言"}
                ]
            }
            );

            expect($('.scroller')).toExist();
            expect($('.J_ListItem').length).toBe(2);
            expect($('.J_ImgDD').length).toBe(2);
            htmlMock.clean();
        })

        it('判断一个mock html为vm模版',function(){
            var isVm = htmlMock.isVm('./specs/vms/complexList.vm');
             expect(isVm).toBeTruthy();

            isVm = htmlMock.isVm('./specs/vms/complexList.html');
            expect(isVm).toBeFalsy();
        })
    });

},{requires:['node','jasmine/htmlMock']});