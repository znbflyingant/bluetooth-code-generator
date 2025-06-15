// 调试助手函数

// 调试字符串长度配置
function debugStringLengthConfig() {
    console.log('=== 字符串长度配置调试 ===');
    
    // 检查Req字段
    const reqFields = getFieldsFromList('req');
    console.log('Req字段数量:', reqFields.length);
    reqFields.forEach((field, index) => {
        console.log(`Req字段 ${index + 1}:`, {
            name: field.name,
            type: field.type,
            stringLengthBytes: field.stringLengthBytes
        });
        
        if ((field.type === 'String' || field.type === 'MutableList<String>') && !field.stringLengthBytes) {
            console.warn(`⚠️ 字段 ${field.name} 是字符串类型但没有stringLengthBytes配置`);
        }
    });
    
    // 检查Rsp字段
    const rspFields = getFieldsFromList('rsp');
    console.log('Rsp字段数量:', rspFields.length);
    rspFields.forEach((field, index) => {
        console.log(`Rsp字段 ${index + 1}:`, {
            name: field.name,
            type: field.type,
            stringLengthBytes: field.stringLengthBytes
        });
        
        if ((field.type === 'String' || field.type === 'MutableList<String>') && !field.stringLengthBytes) {
            console.warn(`⚠️ 字段 ${field.name} 是字符串类型但没有stringLengthBytes配置`);
        }
    });
    
    return { reqFields, rspFields };
}

// 测试字符串长度配置在序列化代码中的使用
function testStringLengthInSerialization(fields) {
    console.log('=== 测试序列化代码生成 ===');
    
    const stringFields = fields.filter(field => 
        field.type === 'String' || field.type === 'MutableList<String>'
    );
    
    if (stringFields.length === 0) {
        console.log('没有字符串类型字段需要测试');
        return;
    }
    
    console.log('发现字符串字段:', stringFields);
    
    // 测试fromByteArray代码生成
    const fromByteArrayCode = generateFromByteArrayCode(stringFields);
    console.log('fromByteArray代码:', fromByteArrayCode);
    
    // 测试toByteArray代码生成
    const toByteArrayCode = generateToByteArrayCode(stringFields);
    console.log('toByteArray代码:', toByteArrayCode);
    
    // 检查代码中是否包含正确的长度配置
    stringFields.forEach(field => {
        const lengthBytes = field.stringLengthBytes || 1;
        
        if (lengthBytes > 1) {
            const expectedHelper = `CmdHelper.byte${lengthBytes}ToInt`;
            if (fromByteArrayCode.includes(expectedHelper)) {
                console.log(`✅ 字段 ${field.name} 正确使用了${lengthBytes}字节长度配置`);
            } else {
                console.error(`❌ 字段 ${field.name} 未正确使用${lengthBytes}字节长度配置`);
            }
        }
    });
}

// 完整的调试流程
function debugFullStringLengthFlow() {
    console.log('开始完整的字符串长度配置调试...');
    
    const { reqFields, rspFields } = debugStringLengthConfig();
    
    if (reqFields.length > 0) {
        console.log('=== 测试Req字段序列化 ===');
        testStringLengthInSerialization(reqFields);
    }
    
    if (rspFields.length > 0) {
        console.log('=== 测试Rsp字段序列化 ===');
        testStringLengthInSerialization(rspFields);
    }
    
    console.log('调试完成！');
}

// 在浏览器控制台中可用的全局调试函数
window.debugStringLength = debugFullStringLengthFlow;

console.log('💡 调试助手已加载！在控制台中输入 debugStringLength() 来调试字符串长度配置'); 