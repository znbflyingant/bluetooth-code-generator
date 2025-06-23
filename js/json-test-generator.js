// JSON测试数据生成器

// 生成单个字段的测试数据
function generateTestValue(field) {
    const fieldType = field.type;
    const fieldName = field.name;
    
    switch (fieldType) {
        case 'String':
            // 生成有意义的测试字符串
            const stringExamples = {
                'name': '测试用户',
                'title': '测试标题',
                'content': '这是一个测试内容',
                'url': 'https://example.com',
                'path': '/test/path',
                'id': 'test_id_123',
                'token': 'test_token_abc123',
                'message': '测试消息',
                'description': '测试描述信息',
                'filename': 'test_file.txt',
                'data': '测试数据'
            };
            
            for (let key in stringExamples) {
                if (fieldName.toLowerCase().includes(key)) {
                    return stringExamples[key];
                }
            }
            return `测试${fieldName}`;
            
        case 'Int':
        case 'Int3':
        case 'Int2':
        case 'Int1':
            // 根据字段名生成合理的整数值
            if (fieldName.toLowerCase().includes('count') || fieldName.toLowerCase().includes('num')) {
                return Math.floor(Math.random() * 100) + 1;
            } else if (fieldName.toLowerCase().includes('id')) {
                return Math.floor(Math.random() * 10000) + 1;
            } else if (fieldName.toLowerCase().includes('status') || fieldName.toLowerCase().includes('state')) {
                return Math.floor(Math.random() * 5);
            } else if (fieldName.toLowerCase().includes('time') || fieldName.toLowerCase().includes('timestamp')) {
                return Math.floor(Date.now() / 1000);
            } else if (fieldName.toLowerCase().includes('version')) {
                return Math.floor(Math.random() * 10) + 1;
            } else if (fieldName.toLowerCase().includes('size') || fieldName.toLowerCase().includes('length')) {
                return Math.floor(Math.random() * 1000) + 1;
            }
            return Math.floor(Math.random() * 1000);
            
        case 'Long':
            if (fieldName.toLowerCase().includes('time') || fieldName.toLowerCase().includes('timestamp')) {
                return Date.now();
            }
            return Math.floor(Math.random() * 100000000) + 1000000;
            
        case 'Short':
            return Math.floor(Math.random() * 32767);
            
        case 'Byte':
            return Math.floor(Math.random() * 255);
            
        case 'Boolean':
            // 根据字段名生成合理的布尔值
            if (fieldName.toLowerCase().includes('enable') || fieldName.toLowerCase().includes('active')) {
                return true;
            } else if (fieldName.toLowerCase().includes('disable') || fieldName.toLowerCase().includes('invalid')) {
                return false;
            }
            return Math.random() > 0.5;
            
        case 'Float':
            if (fieldName.toLowerCase().includes('rate') || fieldName.toLowerCase().includes('ratio')) {
                return parseFloat((Math.random()).toFixed(2));
            } else if (fieldName.toLowerCase().includes('temperature')) {
                return parseFloat((Math.random() * 50 + 20).toFixed(1));
            } else if (fieldName.toLowerCase().includes('voltage')) {
                return parseFloat((Math.random() * 10 + 1).toFixed(2));
            }
            return parseFloat((Math.random() * 1000).toFixed(2));
            
        case 'Double':
            return parseFloat((Math.random() * 10000).toFixed(3));
            
        case 'ByteArray':
            // 生成Base64编码的测试数据
            const testBytes = [];
            const length = Math.floor(Math.random() * 20) + 5;
            for (let i = 0; i < length; i++) {
                testBytes.push(Math.floor(Math.random() * 256));
            }
            return btoa(String.fromCharCode.apply(null, testBytes));
            
        case 'MutableList<String>':
            const stringListSize = Math.floor(Math.random() * 5) + 1;
            const stringList = [];
            for (let i = 0; i < stringListSize; i++) {
                stringList.push(`列表项${i + 1}`);
            }
            return stringList;
            
        case 'MutableList<Int>':
        case 'MutableList<Int3>':
        case 'MutableList<Int2>':
        case 'MutableList<Int1>':
            const intListSize = Math.floor(Math.random() * 5) + 1;
            const intList = [];
            for (let i = 0; i < intListSize; i++) {
                intList.push(Math.floor(Math.random() * 100) + 1);
            }
            return intList;
            
        case 'MutableList<Byte>':
            const byteListSize = Math.floor(Math.random() * 10) + 1;
            const byteList = [];
            for (let i = 0; i < byteListSize; i++) {
                byteList.push(Math.floor(Math.random() * 255));
            }
            return byteList;
            
        default:
            return `未知类型${fieldType}的测试值`;
    }
}

// 生成单个JSON对象的测试数据
function generateJsonTestData(fields, className = 'TestClass') {
    if (!fields || fields.length === 0) {
        return {};
    }
    
    const testData = {};
    
    fields.forEach(field => {
        testData[field.name] = generateTestValue(field);
    });
    
    return testData;
}

// 生成多个测试样例
function generateMultipleJsonTestData(fields, className = 'TestClass', count = 3) {
    const testDataArray = [];
    
    for (let i = 0; i < count; i++) {
        const testData = generateJsonTestData(fields, className);
        testDataArray.push(testData);
    }
    
    return testDataArray;
}

// 格式化JSON字符串（美化输出）
function formatJsonTestData(jsonData, isArray = false) {
    try {
        if (isArray && Array.isArray(jsonData)) {
            let result = '';
            
            jsonData.forEach((data, index) => {
                result += `// 样例 ${index + 1}\n`;
                result += JSON.stringify(data, null, 2);
                if (index < jsonData.length - 1) {
                    result += '\n\n';
                }
            });
            
            return result;
        } else {
            return JSON.stringify(jsonData, null, 2);
        }
    } catch (error) {
        console.error('JSON格式化失败:', error);
        return `// JSON格式化失败: ${error.message}`;
    }
}

// 生成Req类的JSON测试数据
function generateReqJsonTestData() {
    const templateType = document.getElementById('templateType').value;
    
    if (templateType !== 'custom') {
        return '// 请选择"自定义字段"模板并添加字段';
    }
    
    const reqFields = getFieldsFromList('req');
    if (!reqFields || reqFields.length === 0) {
        return '// 请先添加Req字段';
    }
    
    const className = document.getElementById('className').value.trim() || 'Test';
    const reqClassName = `${className}Req`;
    
    // 生成单个测试样例
    const testData = generateJsonTestData(reqFields, reqClassName);
    return formatJsonTestData(testData, false);
}

// 生成Rsp类的JSON测试数据
function generateRspJsonTestData() {
    const templateType = document.getElementById('templateType').value;
    
    if (templateType !== 'custom') {
        return '// 请选择"自定义字段"模板并添加字段';
    }
    
    const rspFields = getFieldsFromList('rsp');
    if (!rspFields || rspFields.length === 0) {
        return '// 请先添加Rsp字段';
    }
    
    const className = document.getElementById('className').value.trim() || 'Test';
    const rspClassName = `${className}Rsp`;
    
    // 生成单个测试样例
    const testData = generateJsonTestData(rspFields, rspClassName);
    return formatJsonTestData(testData, false);
}

// 为现有的生成代码函数添加JSON测试数据生成
function generateJsonTestDataForBoth() {
    // 生成Req JSON测试数据
    const reqJsonTestData = generateReqJsonTestData();
    document.getElementById('reqJsonTestDataOutput').textContent = reqJsonTestData;
    
    // 生成Rsp JSON测试数据  
    const rspJsonTestData = generateRspJsonTestData();
    document.getElementById('rspJsonTestDataOutput').textContent = rspJsonTestData;
    
    // 确保样式正确应用
    if (typeof ensureCodeOutputStyles === 'function') {
        ensureCodeOutputStyles();
    }
    
    console.log('✅ JSON测试数据生成完成');
}

// 增强功能：生成特定场景的测试数据
function generateScenarioTestData(scenario = 'normal') {
    const reqFields = getFieldsFromList('req');
    const rspFields = getFieldsFromList('rsp');
    const className = document.getElementById('className').value.trim() || 'Test';
    
    let reqTestData, rspTestData;
    
    switch (scenario) {
        case 'empty':
            // 生成空值测试数据
            reqTestData = generateEmptyTestData(reqFields, `${className}Req`);
            rspTestData = generateEmptyTestData(rspFields, `${className}Rsp`);
            break;
        case 'max':
            // 生成最大值测试数据
            reqTestData = generateMaxValueTestData(reqFields, `${className}Req`);
            rspTestData = generateMaxValueTestData(rspFields, `${className}Rsp`);
            break;
        case 'edge':
            // 生成边界值测试数据
            reqTestData = generateEdgeCaseTestData(reqFields, `${className}Req`);
            rspTestData = generateEdgeCaseTestData(rspFields, `${className}Rsp`);
            break;
        default:
            // 使用默认的正常测试数据
            reqTestData = generateJsonTestData(reqFields, `${className}Req`);
            rspTestData = generateJsonTestData(rspFields, `${className}Rsp`);
    }
    
    return {
        req: formatJsonTestData(reqTestData),
        rsp: formatJsonTestData(rspTestData)
    };
}

// 生成空值测试数据
function generateEmptyTestData(fields, className) {
    const testData = {};
    
    fields.forEach(field => {
        switch (field.type) {
            case 'String':
                testData[field.name] = "";
                break;
            case 'Int':
            case 'Int3':
            case 'Int2':
            case 'Int1':
            case 'Long':
            case 'Short':
            case 'Byte':
                testData[field.name] = 0;
                break;
            case 'Boolean':
                testData[field.name] = false;
                break;
            case 'Float':
            case 'Double':
                testData[field.name] = 0.0;
                break;
            case 'ByteArray':
                testData[field.name] = "";
                break;
            case 'MutableList<String>':
            case 'MutableList<Int>':
            case 'MutableList<Int3>':
            case 'MutableList<Int2>':
            case 'MutableList<Int1>':
            case 'MutableList<Byte>':
                testData[field.name] = [];
                break;
            default:
                testData[field.name] = null;
        }
    });
    
    return testData;
}

// 生成最大值测试数据
function generateMaxValueTestData(fields, className) {
    const testData = {};
    
    fields.forEach(field => {
        switch (field.type) {
            case 'String':
                const maxLength = field.stringLengthBytes === 1 ? 255 : 
                                field.stringLengthBytes === 2 ? 65535 : 1000;
                testData[field.name] = "A".repeat(Math.min(maxLength, 100)); // 限制显示长度
                break;
            case 'Int1':
                testData[field.name] = 255;
                break;
            case 'Int2':
                testData[field.name] = 65535;
                break;
            case 'Int3':
                testData[field.name] = 16777215;
                break;
            case 'Int':
                testData[field.name] = 2147483647;
                break;
            case 'Long':
                testData[field.name] = 9223372036854775807;
                break;
            case 'Short':
                testData[field.name] = 32767;
                break;
            case 'Byte':
                testData[field.name] = 255;
                break;
            case 'Boolean':
                testData[field.name] = true;
                break;
            case 'Float':
                testData[field.name] = 3.4028235e38;
                break;
            case 'Double':
                testData[field.name] = 1.7976931348623157e308;
                break;
            case 'MutableList<String>':
                testData[field.name] = Array(10).fill("最大测试字符串");
                break;
            case 'MutableList<Int>':
            case 'MutableList<Int3>':
            case 'MutableList<Int2>':
            case 'MutableList<Int1>':
                testData[field.name] = Array(10).fill(999999);
                break;
            case 'MutableList<Byte>':
                testData[field.name] = Array(10).fill(255);
                break;
            default:
                testData[field.name] = generateTestValue(field);
        }
    });
    
    return testData;
}

// 生成边界值测试数据
function generateEdgeCaseTestData(fields, className) {
    const testData = {};
    
    fields.forEach(field => {
        switch (field.type) {
            case 'String':
                // 包含特殊字符的测试字符串
                testData[field.name] = "Test\n换行\t制表符\"引号'单引号\\反斜杠🎵emoji";
                break;
            case 'Int':
            case 'Int3':
            case 'Int2':
            case 'Int1':
                testData[field.name] = -1; // 负数边界
                break;
            case 'Long':
                testData[field.name] = -9223372036854775808; // 最小Long值
                break;
            case 'Short':
                testData[field.name] = -32768; // 最小Short值
                break;
            case 'Byte':
                testData[field.name] = -128; // 最小Byte值
                break;
            case 'Float':
                testData[field.name] = -3.4028235e38; // 最小Float值
                break;
            case 'Double':
                testData[field.name] = -1.7976931348623157e308; // 最小Double值
                break;
            case 'MutableList<String>':
                testData[field.name] = ["", "normal", "特殊字符\n\t\"", "🎵🔧📋"];
                break;
            case 'MutableList<Int>':
                testData[field.name] = [0, -1, 1, 999999, -999999];
                break;
            default:
                testData[field.name] = generateTestValue(field);
        }
    });
    
    return testData;
}

// 实时更新功能：当字段变化时自动重新生成JSON测试数据
function setupJsonTestDataAutoUpdate() {
    // 监听模板类型变化
    const templateTypeSelect = document.getElementById('templateType');
    if (templateTypeSelect) {
        templateTypeSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                // 延迟一点时间以确保字段列表已更新
                setTimeout(() => {
                    if (typeof generateJsonTestDataForBoth === 'function') {
                        generateJsonTestDataForBoth();
                    }
                }, 100);
            }
        });
    }
}

// 页面加载完成后设置自动更新
document.addEventListener('DOMContentLoaded', function() {
    setupJsonTestDataAutoUpdate();
});

// 导出用于其他文件使用的函数
if (typeof window !== 'undefined') {
    window.generateJsonTestDataForBoth = generateJsonTestDataForBoth;
    window.generateScenarioTestData = generateScenarioTestData;
} 