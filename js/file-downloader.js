/**
 * 文件下载功能模块
 * 支持生成的代码文件下载和项目配置导出
 */

// 文件下载工具类
class FileDownloader {
    
    /**
     * 下载文本文件
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     * @param {string} mimeType - MIME类型
     */
    static downloadTextFile(content, filename, mimeType = 'text/plain') {
        try {
            // 创建Blob对象
            const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            
            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 清理URL对象
            URL.revokeObjectURL(url);
            
            // 显示成功提示
            this.showToast(`✅ ${filename} 下载成功！`, 'success');
            
        } catch (error) {
            console.error('下载文件失败:', error);
            this.showToast(`❌ ${filename} 下载失败：${error.message}`, 'error');
        }
    }
    
    /**
     * 下载当前显示的代码文件
     */
    static downloadCurrentCode() {
        try {
            const activeTab = document.querySelector('.tab.active');
            if (!activeTab) {
                this.showToast('❌ 请先生成代码', 'error');
                return;
            }
            
            const tabText = activeTab.textContent.trim();
            const activeContent = document.querySelector('.tab-content.active pre');
            
            if (!activeContent || !activeContent.textContent.trim() || 
                activeContent.textContent.includes('点击"生成代码"按钮开始生成') ||
                activeContent.textContent.includes('代码将在这里显示')) {
                this.showToast('❌ 当前标签页没有可下载的代码', 'error');
                return;
            }
            
            const content = activeContent.textContent;
            const { filename, mimeType } = this.getFileInfo(tabText, content);
            
            this.downloadTextFile(content, filename, mimeType);
            
        } catch (error) {
            console.error('下载当前代码失败:', error);
            this.showToast(`❌ 下载失败：${error.message}`, 'error');
        }
    }
    
    /**
     * 下载所有生成的文件为压缩包
     */
    static async downloadAllFiles() {
        try {
            // 检查JSZip是否可用
            if (typeof JSZip === 'undefined') {
                this.showToast('❌ JSZip库未加载，无法创建压缩包', 'error');
                return;
            }

            const filesToDownload = [];
            const tabs = document.querySelectorAll('.tab');
            
            tabs.forEach(tab => {
                const tabText = tab.textContent.trim();
                const tabId = this.getTabContentId(tabText);
                const content = document.querySelector(`#${tabId} pre`);
                
                if (content && content.textContent.trim() && 
                    !content.textContent.includes('点击"生成代码"按钮开始生成') &&
                    !content.textContent.includes('代码将在这里显示') &&
                    !content.textContent.includes('请选择"自定义字段"模板') &&
                    !content.textContent.includes('请先添加')) {
                    
                    const { filename, mimeType } = this.getFileInfo(tabText, content.textContent);
                    filesToDownload.push({
                        filename,
                        content: content.textContent,
                        mimeType
                    });
                }
            });
            
            if (filesToDownload.length === 0) {
                this.showToast('❌ 没有可下载的文件，请先生成代码', 'error');
                return;
            }

            // 显示进度提示
            this.showToast('📦 正在创建压缩包...', 'info');
            
            // 创建ZIP压缩包
            const zip = new JSZip();
            
            // 创建文件夹结构
            const kotlinFolder = zip.folder("kotlin");
            const dartFolder = zip.folder("dart");
            const testDataFolder = zip.folder("test-data");
            
            // 标记是否已添加Swift ByteConverter
            let swiftByteConverterAdded = false;
            
            // 根据文件类型添加到对应文件夹
            filesToDownload.forEach(file => {
                const filename = file.filename;
                const content = file.content;
                
                // 更精确的文件分类逻辑
                if (filename.endsWith('.kt')) {
                    if (filename.includes('Enum') || content.includes('enum class') || content.includes('enum ')) {
                        // 枚举文件放在根目录
                        zip.file(filename, content);
                    } else {
                        // Kotlin类文件
                        kotlinFolder.file(filename, content);
                    }
                } else if (filename.endsWith('.dart')) {
                    // Dart类文件
                    dartFolder.file(filename, content);
                } else if (filename.endsWith('.swift')) {
                    // Swift类文件
                    const swiftFolder = zip.folder("swift");
                    swiftFolder.file(filename, content);
                    
                    // 自动添加ByteConverter.swift工具类文件（只添加一次）
                    if (!swiftByteConverterAdded && typeof generateSwiftByteConverterFile === 'function') {
                        const byteConverterContent = generateSwiftByteConverterFile();
                        swiftFolder.file("ByteConverter.swift", byteConverterContent);
                        swiftByteConverterAdded = true;
                    }
                } else if (filename.endsWith('.json')) {
                    // JSON测试数据
                    testDataFolder.file(filename, content);
                } else {
                    // 其他文件放在根目录
                    zip.file(filename, content);
                }
            });
            
            // 添加README文件
            const readmeContent = this.generateReadmeContent(filesToDownload);
            zip.file("README.md", readmeContent);
            
            // 生成压缩包
            const zipBlob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: 6
                }
            });
            
            // 生成下载文件名
            const enumName = document.getElementById('enumName')?.value?.trim() || 'Generated';
            const className = document.getElementById('className')?.value?.trim() || 'GeneratedClass';
            const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            
            // 优先使用enumName，如果没有则使用className，最后使用默认值
            const projectName = enumName || className || 'BluetoothCommand';
            const zipFilename = `${projectName}_${timestamp}.zip`;
            
            // 下载压缩包
            const downloadUrl = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = zipFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
            
            this.showToast(`✅ 压缩包已生成：${zipFilename} (${filesToDownload.length} 个文件)`, 'success');
            
        } catch (error) {
            console.error('创建压缩包失败:', error);
            this.showToast(`❌ 创建压缩包失败：${error.message}`, 'error');
        }
    }

    /**
     * 生成README文件内容
     */
    static generateReadmeContent(files) {
        const enumName = document.getElementById('enumName')?.value?.trim() || 'Generated';
        const description = document.getElementById('description')?.value?.trim() || '';
        const mainCmd = document.getElementById('mainCmd')?.value || '';
        const subCmd = document.getElementById('subCmd')?.value || '';
        
        let readme = `# ${enumName} - 蓝牙指令代码包\n\n`;
        readme += `## 基本信息\n`;
        readme += `- **项目名称**: ${enumName}\n`;
        if (description) readme += `- **描述**: ${description}\n`;
        readme += `- **主命令**: ${mainCmd}\n`;
        readme += `- **子命令**: ${subCmd}\n`;
        readme += `- **生成时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
        
        readme += `## 文件结构\n\n`;
        readme += `### 📁 kotlin/\nKotlin类文件，包含Req和Rsp数据类，用于Android项目\n\n`;
        readme += `### 📁 dart/\nDart类文件，包含Req和Rsp数据类，用于Flutter项目\n\n`;
        readme += `### 📁 swift/\nSwift类文件，包含Req和Rsp数据类以及ByteConverter工具类，用于iOS项目\n\n`;
        readme += `### 📁 test-data/\nJSON测试数据，可用于接口测试和调试\n\n`;
        readme += `### 📄 枚举文件\n枚举定义文件，定义了命令类型和相关常量\n\n`;
        
        readme += `## 文件列表\n\n`;
        files.forEach((file, index) => {
            readme += `${index + 1}. **${file.filename}**\n`;
        });
        
        readme += `\n## 使用说明\n\n`;
        readme += `1. **Kotlin文件**: 直接复制到Android项目的对应包路径\n`;
        readme += `2. **Dart文件**: 复制到Flutter项目的model目录\n`;
        readme += `3. **Swift文件**: 复制到iOS项目的model目录，ByteConverter.swift为必需的工具类\n`;
        readme += `4. **枚举文件**: 根据项目需要放置到相应的包/模块中\n`;
        readme += `5. **JSON测试数据**: 用于Postman、单元测试等工具进行接口测试\n\n`;
        
        readme += `## 注意事项\n\n`;
        readme += `- Swift项目需要同时引入ByteConverter.swift工具类\n`;
        readme += `- 所有代码都使用小端序字节转换，与Java/Kotlin CmdHelper兼容\n`;
        readme += `- JSON测试数据包含了随机生成的样本数据，实际使用时请根据需要修改\n\n`;
        
        readme += `---\n`;
        readme += `*由蓝牙指令代码生成器自动生成*\n`;
        
        return readme;
    }
    
    /**
     * 导出项目配置 - 根据MainCmdConfig和SubCmdConfig的hexCode值生成配置
     */
    static exportProjectConfig() {
        try {
            // 获取基本表单数据
            const description = document.getElementById('description')?.value?.trim() || '';
            const enumName = document.getElementById('enumName')?.value?.trim() || '';
            const mainCmdValue = document.getElementById('mainCmd')?.value || '';
            const subCmdValue = document.getElementById('subCmd')?.value || '';
            
            // 验证必要字段
            if (!description) {
                throw new Error('请填写描述信息');
            }
            if (!mainCmdValue) {
                throw new Error('请选择主命令(MainCmd)');
            }
            if (subCmdValue === null || subCmdValue === undefined || subCmdValue === '') {
                throw new Error('请选择子命令(SubCmd)');
            }
            
            // 获取MainCmd配置
            let mainCmdConfig = null;
            if (typeof getMainCmdByValue === 'function') {
                mainCmdConfig = getMainCmdByValue(mainCmdValue);
            }
            
            if (!mainCmdConfig) {
                throw new Error('无法获取MainCmd配置信息');
            }
            
            // 获取SubCmd配置
            let subCmdConfig = null;
            if (typeof getSubCmdByDecimal === 'function') {
                const subCmdDecimal = parseInt(subCmdValue);
                subCmdConfig = getSubCmdByDecimal(subCmdDecimal);
            }
            
            if (!subCmdConfig) {
                throw new Error('无法获取SubCmd配置信息');
            }
            
            // 获取MainCmd和SubCmd的十六进制值
            const mainCmdHex = mainCmdConfig.hexCode; // 如 '0x01'
            const subCmdHex = subCmdConfig.hex;       // 如 '0x00'
            
            // 生成配置ID (MainCmd hexCode + SubCmd hexValue)
            const configId = `${mainCmdHex}_${subCmdHex}`;
            
            // 生成配置结构
            const config = {
                // 基本信息
                id: configId,
                description: description,
                exportTime: new Date().toISOString(),
                
                // 核心命令信息
                mainCmd: mainCmdHex,
                subCmd: subCmdHex,
                
                // 额外信息
                enumName: enumName,
                mainCmdInfo: {
                    value: mainCmdConfig.value,
                    enumType: mainCmdConfig.enumType,
                    serviceName: mainCmdConfig.serviceName,
                    description: mainCmdConfig.description
                },
                subCmdInfo: {
                    decimal: subCmdConfig.decimal,
                    display: subCmdConfig.display
                },
                
                // 字段信息
                fields: {
                    req: this.extractFieldsConfig('req'),
                    rsp: this.extractFieldsConfig('rsp')
                }
            };
            
            // 生成文件名
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const safeEnumName = (enumName || 'Config').replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `${safeEnumName}_${configId.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
            
            const configJson = JSON.stringify(config, null, 2);
            this.downloadTextFile(configJson, filename, 'application/json');
            
            this.showToast('✅ 配置导出成功', 'success');
            
            // 调试信息
            console.log('导出配置:', {
                id: configId,
                description: description,
                mainCmd: mainCmdHex,
                subCmd: subCmdHex,
                mainCmdConfig: mainCmdConfig,
                subCmdConfig: subCmdConfig
            });
            
        } catch (error) {
            console.error('导出配置失败:', error);
            this.showToast(`❌ 导出配置失败：${error.message}`, 'error');
        }
    }
    
    /**
     * 提取字段配置
     * @param {string} type - 字段类型 ('req' 或 'rsp')
     * @returns {Array} 字段配置数组
     */
    static extractFieldsConfig(type) {
        const fields = [];
        const fieldList = document.getElementById(`${type}FieldList`);
        
        if (fieldList) {
            const fieldItems = fieldList.querySelectorAll('.field-item');
            fieldItems.forEach(item => {
                const nameInput = item.querySelector('input[placeholder*="字段名"]');
                const typeSelect = item.querySelector('select.field-type');
                
                if (nameInput && typeSelect && nameInput.value.trim() && typeSelect.value) {
                    const selectedValue = typeSelect.value;
                    let fieldType, stringLengthBytes;
                    
                    // 解析类型和字符串长度
                    if (selectedValue.includes(':')) {
                        // 格式: "String:2" 或 "MutableList<String>:3"
                        const [type, lengthStr] = selectedValue.split(':');
                        fieldType = type;
                        stringLengthBytes = parseInt(lengthStr) || 1;
                    } else {
                        // 普通类型，无长度配置
                        fieldType = selectedValue;
                        stringLengthBytes = null;
                    }
                    
                    const field = {
                        name: nameInput.value.trim(),
                        type: fieldType
                    };
                    
                    // 如果是字符串类型，添加长度字节数配置
                    if (stringLengthBytes !== null) {
                        field.stringLengthBytes = stringLengthBytes;
                    }
                    
                    fields.push(field);
                }
            });
        }
        
        return fields;
    }
    
    /**
     * 根据标签文本获取对应的内容区域ID
     * @param {string} tabText - 标签文本
     * @returns {string} 内容区域ID
     */
    static getTabContentId(tabText) {
        const tabMap = {
            '枚举项': 'enumCode',
            'Req 类': 'reqClassCode',
            'Rsp 类': 'rspClassCode',
            'Dart Req 类': 'dartReqClassCode',
            'Dart Rsp 类': 'dartRspClassCode',
            'Swift Req 类': 'swiftReqClassCode',
            'Swift Rsp 类': 'swiftRspClassCode',

            '📋 Req 测试JSON': 'reqJsonTestData',
            '📋 Rsp 测试JSON': 'rspJsonTestData'
        };
        return tabMap[tabText] || 'enumCode';
    }
    
    /**
     * 获取文件信息（文件名和MIME类型）
     * @param {string} tabText - 标签文本
     * @param {string} content - 文件内容
     * @returns {Object} 包含filename和mimeType的对象
     */
    static getFileInfo(tabText, content) {
        const enumName = document.getElementById('enumName')?.value || 'Generated';
        const className = document.getElementById('className')?.value || 'GeneratedClass';
        
        let filename = '';
        let mimeType = 'text/plain';
        
        // 添加驼峰转下划线的辅助函数
        const camelToSnake = (str) => {
            return str
                .replace(/([A-Z])/g, '_$1')  // 在大写字母前添加下划线
                .toLowerCase()               // 转换为小写
                .replace(/^_/, '');          // 移除开头的下划线（如果有）
        };
        
        // 尝试从内容中提取真实的类名
        const extractClassNameFromContent = (content, type) => {
            if (!content) return className + type;
            
            // 匹配 class ClassName 或 object ClassName 模式
            const kotlinClassMatch = content.match(/(?:class|object)\s+(\w+)/);
            if (kotlinClassMatch) {
                return kotlinClassMatch[1];
            }
            
            // 匹配 Dart 类: class ClassName
            const dartClassMatch = content.match(/class\s+(\w+)/);
            if (dartClassMatch) {
                return dartClassMatch[1];
            }
            
            // 匹配 Swift 类: class ClassName
            const swiftClassMatch = content.match(/class\s+(\w+)/);
            if (swiftClassMatch) {
                return swiftClassMatch[1];
            }
            
            // 如果没有匹配到，返回默认名称
            return className + type;
        };
        
        // 尝试从内容中提取枚举名
        const extractEnumNameFromContent = (content) => {
            if (!content) return enumName;
            
            // 匹配枚举名: enum class EnumName 或 enum EnumName
            const enumMatch = content.match(/enum\s+(?:class\s+)?(\w+)/);
            if (enumMatch) {
                return enumMatch[1];
            }
            
            return enumName;
        };
        
        switch (tabText) {
            case '枚举项':
                const realEnumName = extractEnumNameFromContent(content);
                filename = `${realEnumName}.kt`;
                mimeType = 'text/x-kotlin';
                break;
            case 'Req 类':
                const kotlinReqName = extractClassNameFromContent(content, 'Req');
                filename = `${kotlinReqName}.kt`;
                mimeType = 'text/x-kotlin';
                break;
            case 'Rsp 类':
                const kotlinRspName = extractClassNameFromContent(content, 'Rsp');
                filename = `${kotlinRspName}.kt`;
                mimeType = 'text/x-kotlin';
                break;
            case 'Dart Req 类':
                const dartReqName = extractClassNameFromContent(content, 'Req');
                filename = `${camelToSnake(dartReqName)}.dart`;
                mimeType = 'text/x-dart';
                break;
            case 'Dart Rsp 类':
                const dartRspName = extractClassNameFromContent(content, 'Rsp');
                filename = `${camelToSnake(dartRspName)}.dart`;
                mimeType = 'text/x-dart';
                break;
            case 'Swift Req 类':
                const swiftReqName = extractClassNameFromContent(content, 'Req');
                filename = `${swiftReqName}.swift`;
                mimeType = 'text/x-swift';
                break;
            case 'Swift Rsp 类':
                const swiftRspName = extractClassNameFromContent(content, 'Rsp');
                filename = `${swiftRspName}.swift`;
                mimeType = 'text/x-swift';
                break;
            case '📋 Req 测试JSON':
                filename = `${className}Req_TestData.json`;
                mimeType = 'application/json';
                break;
            case '📋 Rsp 测试JSON':
                filename = `${className}Rsp_TestData.json`;
                mimeType = 'application/json';
                break;
            default:
                filename = `generated_code.txt`;
        }
        
        return { filename, mimeType };
    }
    
    /**
     * 显示提示消息
     * @param {string} message - 提示消息
     * @param {string} type - 消息类型 ('success', 'error', 'info')
     */
    static showToast(message, type = 'info') {
        // 移除现有的toast
        const existingToast = document.querySelector('.download-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `download-toast toast-${type}`;
        toast.textContent = message;
        
        // 添加样式
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            max-width: 350px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease;
        `;
        
        // 添加CSS动画
        if (!document.querySelector('#download-toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'download-toast-styles';
            styles.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // 添加到页面
        document.body.appendChild(toast);
        
        // 3秒后自动移除
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
        
        // 点击关闭
        toast.addEventListener('click', () => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }
    
    /**
     * 导入项目配置 - 触发文件选择器
     */
    static importProjectConfig() {
        const fileInput = document.getElementById('configFileInput');
        if (fileInput) {
            fileInput.click();
        } else {
            console.error('找不到文件输入元素');
            this.showToast('❌ 导入功能初始化失败', 'error');
        }
    }

    /**
     * 处理配置文件选择
     * @param {Event} event - 文件选择事件
     */
    static handleConfigFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        // 验证文件类型
        if (!file.name.toLowerCase().endsWith('.json')) {
            this.showToast('❌ 请选择JSON配置文件', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const configData = JSON.parse(e.target.result);
                this.applyImportedConfig(configData);
                this.showToast('✅ 配置导入成功', 'success');
            } catch (error) {
                console.error('配置文件解析失败:', error);
                this.showToast(`❌ 配置文件格式错误：${error.message}`, 'error');
            }
        };

        reader.onerror = () => {
            this.showToast('❌ 文件读取失败', 'error');
        };

        reader.readAsText(file);
        
        // 清空文件输入，允许重新选择同一文件
        event.target.value = '';
    }

    /**
     * 应用导入的配置到表单
     * @param {Object} config - 导入的配置对象
     */
    static applyImportedConfig(config) {
        try {
            console.log('导入配置:', config);

            // 1. 设置基本信息
            if (config.description) {
                const descriptionElement = document.getElementById('description');
                if (descriptionElement) {
                    descriptionElement.value = config.description;
                }
            }

            if (config.enumName) {
                const enumNameElement = document.getElementById('enumName');
                if (enumNameElement) {
                    enumNameElement.value = config.enumName;
                }
            }

            // 2. 设置MainCmd - 需要根据hexCode找到对应的value
            if (config.mainCmd && typeof getMainCmdByHexCode === 'function') {
                const mainCmdConfig = getMainCmdByHexCode(config.mainCmd);
                if (mainCmdConfig) {
                    const mainCmdElement = document.getElementById('mainCmd');
                    if (mainCmdElement) {
                        mainCmdElement.value = mainCmdConfig.value;
                        // 触发change事件
                        if (typeof onMainCmdChange === 'function') {
                            onMainCmdChange(mainCmdConfig.value);
                        }
                    }
                }
            }

            // 3. 设置SubCmd - 需要根据hex值找到对应的decimal
            if (config.subCmd && typeof getSubCmdByHex === 'function') {
                const subCmdConfig = getSubCmdByHex(config.subCmd);
                if (subCmdConfig) {
                    const subCmdElement = document.getElementById('subCmd');
                    if (subCmdElement) {
                        subCmdElement.value = subCmdConfig.decimal;
                        // 触发change事件
                        if (typeof onSubCmdChange === 'function') {
                            onSubCmdChange(subCmdConfig.decimal.toString());
                        }
                    }
                }
            }

            // 4. 设置字段配置
            if (config.fields) {
                // 切换到自定义字段模板
                const templateTypeElement = document.getElementById('templateType');
                if (templateTypeElement) {
                    templateTypeElement.value = 'custom';
                    // 触发模板切换事件
                    const changeEvent = new Event('change');
                    templateTypeElement.dispatchEvent(changeEvent);
                }

                // 导入Req字段
                if (config.fields.req && Array.isArray(config.fields.req)) {
                    this.importFields('req', config.fields.req);
                }

                // 导入Rsp字段
                if (config.fields.rsp && Array.isArray(config.fields.rsp)) {
                    this.importFields('rsp', config.fields.rsp);
                }
            }

            // 5. 触发代码生成（可选）
            // this.generateCodeFromImport();

            console.log('配置导入完成');

        } catch (error) {
            console.error('应用配置失败:', error);
            this.showToast(`❌ 配置应用失败：${error.message}`, 'error');
        }
    }

    /**
     * 导入字段配置
     * @param {string} type - 字段类型 'req' 或 'rsp'
     * @param {Array} fields - 字段配置数组
     */
    static importFields(type, fields) {
        try {
            // 清空现有字段
            if (typeof clearAllFields === 'function') {
                clearAllFields(type);
            }

            // 添加导入的字段
            fields.forEach(field => {
                if (typeof addField === 'function') {
                    addField(type);
                }

                // 获取最新添加的字段容器
                const fieldList = document.getElementById(`${type}FieldList`);
                if (fieldList) {
                    const fieldContainers = fieldList.querySelectorAll('.field-item');
                    const lastFieldContainer = fieldContainers[fieldContainers.length - 1];
                    
                    if (lastFieldContainer) {
                        // 设置字段名
                        const nameInput = lastFieldContainer.querySelector('input[placeholder*="字段名"]');
                        if (nameInput && field.name) {
                            nameInput.value = field.name;
                        }

                        // 设置字段类型
                        const typeSelect = lastFieldContainer.querySelector('select.field-type');
                        if (typeSelect && field.type) {
                            // 根据字段类型和stringLengthBytes组合成正确的value
                            let selectValue = field.type;
                            
                            // 如果是字符串类型且有长度配置，需要组合成 "String:2" 格式
                            if ((field.type === 'String' || field.type === 'MutableList<String>') && field.stringLengthBytes) {
                                selectValue = `${field.type}:${field.stringLengthBytes}`;
                            }
                            
                            // 查找匹配的option并设置
                            const options = Array.from(typeSelect.options);
                            const matchingOption = options.find(option => option.value === selectValue);
                            
                            if (matchingOption) {
                                typeSelect.value = selectValue;
                                console.log(`✅ 设置字段 ${field.name} 类型为: ${selectValue}`);
                            } else {
                                // 如果找不到精确匹配，尝试基础类型
                                typeSelect.value = field.type;
                                console.warn(`⚠️ 字段 ${field.name} 未找到精确匹配的类型 ${selectValue}，使用基础类型 ${field.type}`);
                            }
                            
                            // 触发change事件以显示相关选项
                            const changeEvent = new Event('change');
                            typeSelect.dispatchEvent(changeEvent);
                        }
                    }
                }
            });

            console.log(`✅ ${type} 字段导入完成，共导入 ${fields.length} 个字段`);

        } catch (error) {
            console.error(`导入${type}字段失败:`, error);
        }
    }

    /**
     * 从导入的配置生成代码（可选功能）
     */
    static generateCodeFromImport() {
        try {
            // 延迟执行以确保所有字段都已设置
            setTimeout(() => {
                if (typeof generateCode === 'function') {
                    generateCode();
                }
            }, 500);
        } catch (error) {
            console.error('自动生成代码失败:', error);
        }
    }

    /**
     * 初始化拖拽功能
     */
    static initializeDragAndDrop() {
        const dragOverlay = document.getElementById('dragOverlay');
        let dragCounter = 0; // 用于跟踪拖拽事件的计数器
        
        if (!dragOverlay) {
            console.warn('拖拽覆盖层未找到，跳过拖拽功能初始化');
            return;
        }

        // 阻止默认拖拽行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        // 拖拽进入
        document.addEventListener('dragenter', (e) => {
            dragCounter++;
            if (FileDownloader.isValidDragEvent(e)) {
                FileDownloader.showDragOverlay();
            }
        });

        // 拖拽悬停
        document.addEventListener('dragover', (e) => {
            if (FileDownloader.isValidDragEvent(e)) {
                e.dataTransfer.dropEffect = 'copy';
            }
        });

        // 拖拽离开
        document.addEventListener('dragleave', (e) => {
            dragCounter--;
            if (dragCounter === 0) {
                FileDownloader.hideDragOverlay();
            }
        });

        // 文件释放
        document.addEventListener('drop', (e) => {
            dragCounter = 0;
            FileDownloader.hideDragOverlay();
            
            if (FileDownloader.isValidDragEvent(e)) {
                const files = Array.from(e.dataTransfer.files);
                FileDownloader.handleDroppedFiles(files);
            }
        });

        console.log('✅ 拖拽功能初始化完成');
    }

    /**
     * 验证是否为有效的拖拽事件（包含文件）
     * @param {DragEvent} e - 拖拽事件
     * @returns {boolean} 是否为有效的拖拽事件
     */
    static isValidDragEvent(e) {
        return e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes('Files');
    }

    /**
     * 显示拖拽覆盖层
     */
    static showDragOverlay() {
        const dragOverlay = document.getElementById('dragOverlay');
        const body = document.body;
        
        if (dragOverlay) {
            dragOverlay.style.display = 'flex';
            // 延迟添加show类以触发动画
            setTimeout(() => {
                dragOverlay.classList.add('show');
            }, 10);
        }
        
        body.classList.add('drag-active');
    }

    /**
     * 隐藏拖拽覆盖层
     */
    static hideDragOverlay() {
        const dragOverlay = document.getElementById('dragOverlay');
        const body = document.body;
        
        if (dragOverlay) {
            dragOverlay.classList.remove('show');
            // 延迟隐藏元素以等待动画完成
            setTimeout(() => {
                dragOverlay.style.display = 'none';
            }, 300);
        }
        
        body.classList.remove('drag-active');
    }

    /**
     * 处理拖拽释放的文件
     * @param {File[]} files - 释放的文件数组
     */
    static handleDroppedFiles(files) {
        // 过滤出JSON文件
        const jsonFiles = files.filter(file => 
            file.type === 'application/json' || 
            file.name.toLowerCase().endsWith('.json')
        );

        if (jsonFiles.length === 0) {
            FileDownloader.showToast('❌ 请拖拽JSON配置文件', 'error');
            return;
        }

        if (jsonFiles.length > 1) {
            FileDownloader.showToast('❌ 一次只能导入一个配置文件', 'error');
            return;
        }

        // 处理第一个JSON文件
        const file = jsonFiles[0];
        FileDownloader.processDroppedFile(file);
    }

    /**
     * 处理单个拖拽的文件
     * @param {File} file - 要处理的文件
     */
    static processDroppedFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const configData = JSON.parse(e.target.result);
                FileDownloader.applyImportedConfig(configData);
                FileDownloader.showToast(`✅ 成功导入配置文件：${file.name}`, 'success');
                console.log('🎉 拖拽导入配置成功:', {
                    fileName: file.name,
                    fileSize: file.size,
                    configId: configData.id || 'unknown'
                });
            } catch (error) {
                console.error('拖拽文件解析失败:', error);
                FileDownloader.showToast(`❌ 配置文件格式错误：${error.message}`, 'error');
            }
        };

        reader.onerror = () => {
            FileDownloader.showToast(`❌ 文件读取失败：${file.name}`, 'error');
        };

        reader.readAsText(file);
    }
}

// 页面加载完成后初始化拖拽功能
document.addEventListener('DOMContentLoaded', () => {
    FileDownloader.initializeDragAndDrop();
});

// 全局函数，供HTML直接调用
window.downloadCurrentCode = () => FileDownloader.downloadCurrentCode();
window.downloadAllFiles = () => FileDownloader.downloadAllFiles();
window.exportProjectConfig = () => FileDownloader.exportProjectConfig();
window.importProjectConfig = () => FileDownloader.importProjectConfig();
window.handleConfigFileSelect = (event) => FileDownloader.handleConfigFileSelect(event);

// 导出FileDownloader类
window.FileDownloader = FileDownloader;