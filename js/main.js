// 表单提交事件处理
document.getElementById('codeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    generateCode();
});

// 主要的代码生成函数
function generateCode() {
    // 重置复制按钮状态
    const btn = document.getElementById('copyBtn');
    btn.textContent = '📋 复制当前代码';
    btn.style.background = '#28a745';
    
    const enumName = document.getElementById('enumName').value.trim();
    const mainCmd = document.getElementById('mainCmd').value;
    const subCmd = document.getElementById('subCmd').value;
    const description = document.getElementById('description').value.trim();
    const className = document.getElementById('className').value.trim();
    const minVersion = document.getElementById('minVersion').value || '0';
    
    // 从MainCmd配置中获取枚举类型
    let enumType = '';
    if (mainCmd && typeof getMainCmdByValue === 'function') {
        const cmdConfig = getMainCmdByValue(mainCmd);
        if (cmdConfig) {
            enumType = cmdConfig.enumType;
        }
    }
    
    // 备用方案：从选项文本中提取（兼容旧版本）
    if (!enumType && mainCmd) {
        const mainCmdSelect = document.getElementById('mainCmd');
        const selectedOption = mainCmdSelect.options[mainCmdSelect.selectedIndex];
        const optionText = selectedOption.textContent || selectedOption.innerText;
        const match = optionText.match(/\(([^)]+)\)/);
        if (match && match[1]) {
            enumType = match[1];
        }
    }

    if (!enumName || !mainCmd || !subCmd || !description || !enumType) {
        alert('请填写所有必填项！');
        return;
    }

    let fullCode = '';
    let baseName = '';
    let reqClassName = '';
    let rspClassName = '';

    // 智能处理枚举名称，生成 Req 和 Rsp 枚举项
    baseName = enumName;
    
    // 移除已有的 Req/Rsp/Cmd 后缀，获取基础名称
    if (baseName.endsWith('ReqCmd')) {
        baseName = baseName.replace(/ReqCmd$/, '');
    } else if (baseName.endsWith('RspCmd')) {
        baseName = baseName.replace(/RspCmd$/, '');
    } else if (baseName.endsWith('Req')) {
        baseName = baseName.replace(/Req$/, '');
    } else if (baseName.endsWith('Rsp')) {
        baseName = baseName.replace(/Rsp$/, '');
    } else if (baseName.endsWith('Cmd')) {
        baseName = baseName.replace(/Cmd$/, '');
    }
    
    // 生成 Req 和 Rsp 枚举名称
    const reqEnumName = baseName + 'ReqCmd';
    const rspEnumName = baseName + 'RspCmd';
    
    // 处理类名
    let baseClassName = className;
    if (baseClassName) {
        // 移除已有的 Req/Rsp 后缀
        if (baseClassName.endsWith('Req')) {
            baseClassName = baseClassName.replace(/Req$/, '');
        } else if (baseClassName.endsWith('Rsp')) {
            baseClassName = baseClassName.replace(/Rsp$/, '');
        }
    }
    
    reqClassName = baseClassName ? `${baseClassName}Req` : `${baseName}Req`;
    rspClassName = baseClassName ? `${baseClassName}Rsp` : `${baseName}Rsp`;
    
    // 处理描述信息
    let baseDescription = description;
    if (baseDescription.endsWith('Req')) {
        baseDescription = baseDescription.replace(/Req$/, '');
    } else if (baseDescription.endsWith('Rsp')) {
        baseDescription = baseDescription.replace(/Rsp$/, '');
    }
    
    const reqDescription = baseDescription + 'Req';
    const rspDescription = baseDescription + 'Rsp';

    // 生成 Req 代码
    let reqCode = `${reqEnumName}(${mainCmd}, ${subCmd}, CmdOptEnum.req, "${reqDescription}"`;
    if (reqClassName) {
        reqCode += `, ${reqClassName}::class.java`;
    }
    if (minVersion !== '0') {
        if (!reqClassName) {
            reqCode += `, null, ${minVersion}`;
        } else {
            reqCode += `, ${minVersion}`;
        }
    }
    reqCode += '),';

    // 生成 Rsp 代码
    let rspCode = `${rspEnumName}(${mainCmd}, ${subCmd}, CmdOptEnum.rsp, "${rspDescription}"`;
    if (rspClassName) {
        rspCode += `, ${rspClassName}::class.java`;
    }
    if (minVersion !== '0') {
        if (!rspClassName) {
            rspCode += `, null, ${minVersion}`;
        } else {
            rspCode += `, ${minVersion}`;
        }
    }
    rspCode += ');';

    // 生成完整的代码块，包含注释
    fullCode = `// 自动生成的枚举项对 (Req + Rsp)
// 基础名称: ${baseName}
// 描述: ${baseDescription}
// 主命令: ${mainCmd}
// 子命令: ${subCmd}
${baseClassName ? `// 关联类前缀: ${baseClassName}` : ''}
${minVersion !== '0' ? `// 最小版本: ${minVersion}` : ''}

// 请求枚举项
${reqCode}

// 响应枚举项
${rspCode}`;

    // 设置枚举代码
    document.getElementById('generatedCode').textContent = fullCode;
    
    // 确保样式正确应用
    if (typeof ensureCodeOutputStyles === 'function') {
        ensureCodeOutputStyles();
    }

    if (document.getElementById('generateClasses').checked) {
        const templateType = document.getElementById('templateType').value;
        let reqFields = [];
        let rspFields = [];

        if (templateType === 'custom') {
            // 获取 Req 自定义字段
            reqFields = getFieldsFromList('req');
            // 获取 Rsp 自定义字段  
            rspFields = getFieldsFromList('rsp');
            
            // 调试输出字段配置
            console.log('🔍 调试信息 - Req字段配置:', reqFields);
            console.log('🔍 调试信息 - Rsp字段配置:', rspFields);
            
            // 特别检查字符串字段的长度配置
            const checkStringFields = (fields, type) => {
                const stringFields = fields.filter(f => f.type === 'String' || f.type === 'MutableList<String>');
                if (stringFields.length > 0) {
                    console.log(`🔤 ${type} 字符串字段详情:`);
                    stringFields.forEach(field => {
                        console.log(`  - ${field.name}: ${field.type}, 长度字节数: ${field.stringLengthBytes || '未设置'}`);
                        if (!field.stringLengthBytes) {
                            console.warn(`⚠️ 字段 ${field.name} 缺少 stringLengthBytes 配置`);
                        }
                    });
                }
            };
            checkStringFields(reqFields, 'Req');
            checkStringFields(rspFields, 'Rsp');
        }

        // 生成类代码
        if (reqClassName) {
            const reqClassCode = generateClassCode(reqClassName, reqFields, true, baseName, enumType);
            document.getElementById('reqClassCodeOutput').textContent = reqClassCode;
        }
        if (rspClassName) {
            const rspClassCode = generateClassCode(rspClassName, rspFields, false, baseName, enumType);
            document.getElementById('rspClassCodeOutput').textContent = rspClassCode;
        }
        
        // 确保类代码样式正确
        if (typeof ensureCodeOutputStyles === 'function') {
            ensureCodeOutputStyles();
        }

        // 生成Dart类代码
        if (reqClassName) {
            const dartReqClassCode = generateDartClassCode(reqClassName, reqFields, true, baseName, enumType);
            document.getElementById('dartReqClassCodeOutput').textContent = dartReqClassCode;
        }
        if (rspClassName) {
            const dartRspClassCode = generateDartClassCode(rspClassName, rspFields, false, baseName, enumType);
            document.getElementById('dartRspClassCodeOutput').textContent = dartRspClassCode;
        }
        
        // 生成Swift类代码
        if (reqClassName) {
            const swiftReqClassCode = generateSwiftClassCode(reqClassName, reqFields, true, baseName, enumType);
            document.getElementById('swiftReqClassCodeOutput').textContent = swiftReqClassCode;
        }
        if (rspClassName) {
            const swiftRspClassCode = generateSwiftClassCode(rspClassName, rspFields, false, baseName, enumType);
            document.getElementById('swiftRspClassCodeOutput').textContent = swiftRspClassCode;
        }
        
        // 确保Dart和Swift代码样式正确
        if (typeof ensureCodeOutputStyles === 'function') {
            ensureCodeOutputStyles();
        }
    }

    // 生成Service代码
    if (document.getElementById('generateService').checked) {
        const generateClientService = document.getElementById('generateClientService').checked;
        const generateServerService = document.getElementById('generateServerService').checked;
        
        if (generateClientService) {
            const clientServiceCode = generateClientServiceCode(true, reqClassName, rspClassName, baseName);
            document.getElementById('clientServiceCodeOutput').textContent = clientServiceCode;
        } else {
            document.getElementById('clientServiceCodeOutput').textContent = '// 未选择生成 Client Service';
        }
        
        if (generateServerService) {
            const serverServiceCode = generateServerServiceCode(true, reqClassName, rspClassName, baseName);
            document.getElementById('serverServiceCodeOutput').textContent = serverServiceCode;
        } else {
            document.getElementById('serverServiceCodeOutput').textContent = '// 未选择生成 Server Service';
        }
    } else {
        document.getElementById('clientServiceCodeOutput').textContent = '// 未选择生成 Service';
        document.getElementById('serverServiceCodeOutput').textContent = '// 未选择生成 Service';
    }
    
    // 生成JSON测试数据
    if (typeof generateJsonTestDataForBoth === 'function') {
        generateJsonTestDataForBoth();
    }
    
    // 最终确保所有代码区域样式正确
    if (typeof ensureCodeOutputStyles === 'function') {
        setTimeout(ensureCodeOutputStyles, 100); // 延迟执行确保DOM更新完成
    }
}



// 切换Service配置的显示/隐藏
function toggleServiceConfig() {
    const content = document.getElementById('serviceConfigContent');
    const icon = document.getElementById('serviceToggleIcon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼ 点击收起';
    } else {
        content.style.display = 'none';
        icon.textContent = '▶ 点击展开';
    }
}

// 根据Service生成复选框状态控制Service配置区域的显示
function toggleServiceConfigVisibility() {
    const generateServiceCheckbox = document.getElementById('generateService');
    const serviceConfig = document.getElementById('serviceConfig');
    
    if (generateServiceCheckbox.checked) {
        serviceConfig.style.display = 'block';
    } else {
        serviceConfig.style.display = 'none';
        // 同时收起配置内容
        const content = document.getElementById('serviceConfigContent');
        const icon = document.getElementById('serviceToggleIcon');
        content.style.display = 'none';
        icon.textContent = '▶ 点击展开';
    }
}

// 页面加载时初始化Service配置状态
document.addEventListener('DOMContentLoaded', function() {
    // 初始化 MainCmd 下拉选项，不传入默认值，自动选中第一个选项
    if (typeof populateMainCmdSelect === 'function') {
        populateMainCmdSelect('mainCmd'); // 默认选中第一个选项
    }
    
    // 初始化 SubCmd 下拉选项，默认选中第一个选项（0）
    if (typeof populateSubCmdSelect === 'function') {
        populateSubCmdSelect('subCmd', 0); // 默认选中 0
    }
    
    // 默认收起Service配置
    const generateServiceCheckbox = document.getElementById('generateService');
    if (generateServiceCheckbox && generateServiceCheckbox.checked) {
        document.getElementById('serviceConfig').style.display = 'block';
         } else {
         document.getElementById('serviceConfig').style.display = 'none';
     }
});

// 显示使用说明弹窗
function showUsageGuide() {
    const usageContent = `
📖 使用说明

🚀 基本操作：
• 填写枚举项名称和描述信息
• 选择MainCmd后会自动提取枚举类型
• 设置Sub命令号
• 点击"生成代码"按钮自动生成所有代码
• 通过标签页查看不同类型的代码，可分别复制

🔧 字段配置：
• 选择"自定义字段"模板可添加字段
• 分别为 Req 和 Rsp 添加不同的字段
• 字符串类型支持1-4字节长度前缀配置

📋 支持的字段类型：

🔤 字符串类型：
• String (1字节长度) - 最大255字符，适用于ID、状态码
• String (2字节长度) - 最大65535字符，适用于用户名、文件名
• String (3字节长度) - 最大16777215字符，适用于文章内容
• String (4字节长度) - 最大4294967295字符，适用于大型文档

🔢 数值类型：
• Int (4字节) - 标准整数类型
• Int3 (3字节) - 节省空间，范围: 0-16,777,215
• Int2 (2字节) - 节省空间，范围: 0-65,535
• Int1 (1字节) - 节省空间，范围: 0-255
• Long/Short/Byte - 其他数值类型
• Boolean - 布尔类型，转换为 0/1 字节
• Float/Double - 浮点类型

📦 其他类型：
• ByteArray - 字节数组，JSON中使用Base64编码
• MutableList<String> - 字符串列表，支持长度前缀配置
• MutableList<Int/Int3/Int2/Int1/Byte> - 各种数值列表

🔧 生成的文件结构：
• 枚举项：添加到自动提取的枚举类文件中
• Req类：继承 CommonProtoBase，包含完整序列化
• Rsp类：继承 CommonProtoRsp，包含完整序列化
• Dart类：Flutter版本，支持iOS和Android
• Service类：客户端和服务端调用层方法
• 包名：com.tempolor.aimusic.proto.aires
• 自动导入所需的Helper类和依赖

✨ 特色功能：
• 自动生成二进制和JSON序列化方法
• 支持跨平台Kotlin和Dart代码
• 智能类型转换和异常处理
• 完整的Service调用层代码生成
    `;
    
    alert(usageContent);
} 