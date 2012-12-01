KISSY.add(function (S, Node,HtmlMock) {
    var $ = Node.all;
    var htmlMock = new HtmlMock();
    describe('velocity mock test', function () {
        it('��ȷ��ȡ������vmģ��',function(){
            htmlMock.load('./specs/vms/list.vm','./specs/vms/list.json');

            expect($('.scroller')).toExist();
            expect($('.J_ListItem').length).toBe(2);
            expect($('.J_ImgDD').length).toBe(2);
        })
        it('�����α��htmlƬ��',function(){
            htmlMock.clean();

            expect($('.scroller')).not.toExist();
        })

        it('�ӻ�������ȡhtmlƬ��',function(){
            var html = htmlMock.cache['./specs/vms/list.vm'];
            expect(html).not.toBeUndefined();
        })

        it('������',function(){
            htmlMock.cleanCache();
            var html = htmlMock.cache['./specs/vms/list.vm'];
            expect(html).toBeUndefined();

        })


        it('���vmģ���ڴ�����ģ��ʱ�Ĵ���',function(){
            htmlMock.load('./specs/vms/complexList.vm','./specs/vms/list.json');

            expect($('.scroller')).toExist();
            expect($('.J_ListItem').length).toBe(2);
            expect($('.J_ImgDD').length).toBe(2);

            htmlMock.clean();
        })

        it('ֱ�Ӵ���α���ݵ����',function(){
            htmlMock.load('./specs/vms/complexList.vm',{
                "MAP":{
                    "control":"./specs/vms"
                },
                "currentProofMsg":[
                    {"attachment":"http://img01.taobaocdn.com/imgextra/i1/10361016579368429/T1zbCTXfdmXXXXXXXX_!!413810361-0-tstar","roleName":"��","content":"����һ������"},
                    {"attachment":"http://img01.taobaocdn.com/imgextra/i1/10361016579368429/T1zbCTXfdmXXXXXXXX_!!413810361-0-tstar","roleName":"��","content":"����һ������"}
                ]
            }
            );

            expect($('.scroller')).toExist();
            expect($('.J_ListItem').length).toBe(2);
            expect($('.J_ImgDD').length).toBe(2);
            htmlMock.clean();
        })

        it('�ж�һ��mock htmlΪvmģ��',function(){
            var isVm = htmlMock.isVm('./specs/vms/complexList.vm');
             expect(isVm).toBeTruthy();

            isVm = htmlMock.isVm('./specs/vms/complexList.html');
            expect(isVm).toBeFalsy();
        })
    });

},{requires:['node','jasmine/htmlMock']});