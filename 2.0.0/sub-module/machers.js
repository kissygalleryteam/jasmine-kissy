KISSY.add(function(S,Node){
    /**
     * 给kissy增加额外的matchers
     */
    beforeEach(function () {
        var $ = Node.all;
        //添加新的matcher
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
},{requires:['node']});