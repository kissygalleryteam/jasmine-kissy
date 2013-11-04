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