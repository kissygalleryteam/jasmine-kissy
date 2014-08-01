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