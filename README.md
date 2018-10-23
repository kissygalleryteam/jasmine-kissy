# jasmine-kissy

版本：`2.0`

2.0版，jasmine-kissy作为kissy组件出现，基于kissy1.3.0+。

jasmine-kissy是为了方便基于kissy的代码进行单元测试，而向[Jasmine](https://jasmine.github.io/)添加的扩展。

jasmine-kissy主要扩展了如下四个功能

- 1.增加kissy的ajax mock功能（伪造ajax的假数据方便进行ajax测试）
- 2.增加velocity mock功能，直接读取vm模版，使用伪数据mock出测试所依赖的html片段（dom）
- 3.增加html mock功能，同步加载html片段并插入到测试运行页中
- 4.增加用于KISSY的machers，只作用于KISSY的Node模块
