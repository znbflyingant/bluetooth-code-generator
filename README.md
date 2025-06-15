# 蓝牙指令代码生成器

## 文件结构

重构后的代码生成器采用了模块化的文件结构，将原本臃肿的单一HTML文件拆分为多个独立的文件：

### 主要文件

- `code_generator.html` - 主HTML文件，包含页面结构和表单
- `styles.css` - 样式文件，包含所有CSS样式定义

### JavaScript模块 (js/)

- `main.js` - 主要的代码生成逻辑和表单处理
- `field-manager.js` - 字段管理相关功能（添加、删除、验证字段）
- `serialization.js` - 序列化方法生成（fromByteArray、toByteArray）
- `code-generators.js` - 代码生成器核心功能（Kotlin类生成）
- `service-generators.js` - Service和Dart代码生成器
- `utils.js` - 工具函数和事件监听器

## 功能特性

### 智能代码生成
- 自动生成Kotlin枚举项
- 支持Req/Rsp配对生成
- 智能命名规范处理
- 自动类名生成

### 多语言支持
- Kotlin类生成（继承CommonProtoBase/CommonProtoRsp）
- Dart类生成（支持Flutter）
- Service层代码生成（Client/Server）

### 字段类型支持
- 基础类型：String、Int、Long、Short、Byte、Boolean、Float、Double
- 节省空间类型：Int3、Int2、Int1（3字节、2字节、1字节整数）
- 复合类型：ByteArray、MutableList<T>
- 字符串长度配置：1-4字节长度前缀

### 序列化功能
- 二进制序列化（fromByteArray/toByteArray）
- JSON序列化（fromJsonByteArray/toJsonByteArray）
- Base64编码支持
- 异常处理和日志记录

## 使用方法

1. 在浏览器中打开 `code_generator.html`
2. 填写表单参数（描述、枚举名称、命令等）
3. 选择字段类型和配置
4. 点击"生成代码"按钮
5. 在不同标签页中查看生成的代码
6. 复制所需的代码到项目中

## 开发说明

### 模块化设计
- 每个JavaScript文件负责特定功能
- 便于维护和扩展
- 代码复用性更好

### 文件加载顺序
JavaScript文件按以下顺序加载：
1. field-manager.js
2. serialization.js
3. code-generators.js
4. service-generators.js
5. utils.js
6. main.js

### 扩展新功能
- 添加新的字段类型：修改 `field-manager.js` 和 `serialization.js`
- 添加新的代码生成器：在 `code-generators.js` 中添加新函数
- 添加新的语言支持：创建新的生成器文件

## 技术栈

- HTML5
- CSS3 (Grid Layout, Flexbox)
- Vanilla JavaScript (ES6+)
- 无外部依赖

## 浏览器兼容性

支持现代浏览器：
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+ 