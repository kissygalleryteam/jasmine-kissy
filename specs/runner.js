/**
 * @fileoverview ���в�������
 * @author ��ƽ�����ӣ�<minghe36@gmail.com>
 **/
KISSY.add(function (S, Base, Node) {
    function runner(){
        var env = jasmine.getEnv();
        env.addReporter(new jasmine.HtmlReporter);
        env.execute();
    }
    return runner;
},{requires:['base', 'node',
    'specs/ajax-mock-spec'
]});