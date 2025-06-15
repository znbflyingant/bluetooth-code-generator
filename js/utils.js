// 工具函数和事件监听器

// 映射到Dart类型
function mapToDartType(kotlinType) {
    const typeMap = {
        'String': 'String?',
        'Int': 'int?',
        'Int3': 'int?',
        'Int2': 'int?',
        'Int1': 'int?',
        'Long': 'int?',
        'Short': 'int?',
        'Byte': 'int?',
        'Boolean': 'bool?',
        'Float': 'double?',
        'Double': 'double?',
        'ByteArray': 'Uint8List?',
        'MutableList<String>': 'List<String>?',
        'MutableList<Int>': 'List<int>?',
        'MutableList<Int3>': 'List<int>?',
        'MutableList<Int2>': 'List<int>?',
        'MutableList<Int1>': 'List<int>?',
        'MutableList<Byte>': 'List<int>?'
    };
    return typeMap[kotlinType] || 'dynamic';
}

// 切换标签页
function switchTab(tabName, clickedElement) {
    console.log('切换Tab:', tabName); // 调试信息
    
    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 移除所有标签的active状态
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 显示选中的标签内容
    const targetContent = document.getElementById(tabName);
    if (targetContent) {
        targetContent.classList.add('active');
        console.log('激活内容区域:', tabName); // 调试信息
    } else {
        console.error('未找到内容区域:', tabName); // 调试信息
    }
    
    // 激活对应的标签 - 支持多种方式获取点击的元素
    let targetTab = clickedElement;
    if (!targetTab && typeof event !== 'undefined' && event.target) {
        targetTab = event.target;
    }
    if (!targetTab) {
        // 通过tabName找到对应的标签按钮
        targetTab = document.querySelector(`[onclick*="${tabName}"]`);
    }
    
    if (targetTab) {
        targetTab.classList.add('active');
        console.log('激活Tab按钮:', targetTab.textContent); // 调试信息
    } else {
        console.error('未找到Tab按钮'); // 调试信息
    }
    
    // 确保代码区域样式正确
    if (typeof ensureCodeOutputStyles === 'function') {
        setTimeout(ensureCodeOutputStyles, 50);
    }
}

// 复制代码
function copyCode() {
    const activeTab = document.querySelector('.tab-content.active');
    const codeElement = activeTab.querySelector('.output');
    const text = codeElement.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✅ 已复制';
        btn.style.background = '#28a745';
        
        setTimeout(() => {
            btn.textContent = '📋 复制当前代码';
            btn.style.background = '#28a745';
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    });
}

// 显示字符串长度选项
function showStringLengthOption(selectElement, type) {
    const fieldItem = selectElement.closest('.field-item');
    const existingLengthSelect = fieldItem.querySelector('.string-length-select');
    
    if (selectElement.value === 'String' || selectElement.value === 'MutableList<String>') {
        if (!existingLengthSelect) {
            const lengthSelect = document.createElement('select');
            lengthSelect.className = 'string-length-select';
            lengthSelect.style.cssText = 'padding: 8px; font-size: 12px; margin-top: 5px;';
            lengthSelect.innerHTML = `
                <option value="1">1字节长度 (最大255)</option>
                <option value="2">2字节长度 (最大65535)</option>
                <option value="3">3字节长度 (最大16777215)</option>
                <option value="4">4字节长度 (最大4294967295)</option>
            `;
            
            const typeSelectContainer = selectElement.parentElement;
            typeSelectContainer.appendChild(lengthSelect);
        }
    } else {
        if (existingLengthSelect) {
            existingLengthSelect.remove();
        }
    }
}

// 监听枚举名称变化，自动生成类名
document.addEventListener('DOMContentLoaded', function() {
    const enumNameInput = document.getElementById('enumName');
    const classNameInput = document.getElementById('className');
    
    if (enumNameInput && classNameInput) {
        enumNameInput.addEventListener('input', function() {
            const enumName = this.value.trim();
            if (enumName) {
                let baseName = enumName;
                
                // 移除各种后缀，获取基础名称
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
                
                // 首字母大写
                const className = baseName.charAt(0).toUpperCase() + baseName.slice(1);
                classNameInput.value = className;
            }
        });
    }
    
    // 监听模板类型变化
    const templateTypeSelect = document.getElementById('templateType');
    const customFieldsDiv = document.getElementById('customFields');
    
    if (templateTypeSelect && customFieldsDiv) {
        templateTypeSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customFieldsDiv.style.display = 'block';
            } else {
                customFieldsDiv.style.display = 'none';
            }
        });
    }
    
    // 监听Service生成选项变化
    const generateServiceCheckbox = document.getElementById('generateService');
    const serviceConfigDiv = document.getElementById('serviceConfig');
    
    if (generateServiceCheckbox && serviceConfigDiv) {
        generateServiceCheckbox.addEventListener('change', function() {
            serviceConfigDiv.style.display = this.checked ? 'block' : 'none';
        });
    }
    
    // 监听MainCmd变化，自动生成Service名称
    const mainCmdSelect = document.getElementById('mainCmd');
    const serviceNameInput = document.getElementById('serviceName');
    
    if (mainCmdSelect && serviceNameInput) {
        mainCmdSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const optionText = selectedOption.textContent || selectedOption.innerText;
            const match = optionText.match(/\(([^)]+)\)/);
            if (match && match[1]) {
                const enumType = match[1];
                // 从枚举类型生成Service名称
                if (enumType.endsWith('Enum')) {
                    const serviceName = enumType.replace(/Enum$/, 'Service');
                    serviceNameInput.value = serviceName;
                }
            }
        });
    }
});

// 生成 fromJsonByteArray 方法的具体实现
function generateFromJsonCode(fields) {
    let code = '';
    
    fields.forEach((field, index) => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        switch (fieldType) {
            case 'String':
                code += `            ${fieldName} = jsonObject.optString("${fieldName}").takeIf { it.isNotEmpty() }\n`;
                break;
            case 'Int':
            case 'Int3':
            case 'Int2':
            case 'Int1':
                code += `            ${fieldName} = jsonObject.optInt("${fieldName}")\n`;
                break;
            case 'Long':
                code += `            ${fieldName} = jsonObject.optLong("${fieldName}")\n`;
                break;
            case 'Short':
                code += `            ${fieldName} = jsonObject.optInt("${fieldName}").toShort()\n`;
                break;
            case 'Byte':
                code += `            ${fieldName} = jsonObject.optInt("${fieldName}").toByte()\n`;
                break;
            case 'Boolean':
                code += `            ${fieldName} = jsonObject.optBoolean("${fieldName}")\n`;
                break;
            case 'Float':
                code += `            ${fieldName} = jsonObject.optDouble("${fieldName}").toFloat()\n`;
                break;
            case 'Double':
                code += `            ${fieldName} = jsonObject.optDouble("${fieldName}")\n`;
                break;
            case 'ByteArray':
                code += `            val ${fieldName}Base64 = jsonObject.optString("${fieldName}")\n`;
                code += `            if (${fieldName}Base64.isNotEmpty()) {\n`;
                code += `                ${fieldName} = Base64.decode(${fieldName}Base64, Base64.DEFAULT)\n`;
                code += `            }\n`;
                break;
            case 'MutableList<String>':
                code += `            val ${fieldName}Array = jsonObject.optJSONArray("${fieldName}")\n`;
                code += `            if (${fieldName}Array != null) {\n`;
                code += `                ${fieldName} = mutableListOf()\n`;
                code += `                for (i in 0 until ${fieldName}Array.length()) {\n`;
                code += `                    ${fieldName}?.add(${fieldName}Array.optString(i))\n`;
                code += `                }\n`;
                code += `            }\n`;
                break;
            case 'MutableList<Int>':
            case 'MutableList<Int3>':
            case 'MutableList<Int2>':
            case 'MutableList<Int1>':
                code += `            val ${fieldName}Array = jsonObject.optJSONArray("${fieldName}")\n`;
                code += `            if (${fieldName}Array != null) {\n`;
                code += `                ${fieldName} = mutableListOf()\n`;
                code += `                for (i in 0 until ${fieldName}Array.length()) {\n`;
                code += `                    ${fieldName}?.add(${fieldName}Array.optInt(i))\n`;
                code += `                }\n`;
                code += `            }\n`;
                break;
            case 'MutableList<Byte>':
                code += `            val ${fieldName}Array = jsonObject.optJSONArray("${fieldName}")\n`;
                code += `            if (${fieldName}Array != null) {\n`;
                code += `                ${fieldName} = mutableListOf()\n`;
                code += `                for (i in 0 until ${fieldName}Array.length()) {\n`;
                code += `                    ${fieldName}?.add(${fieldName}Array.optInt(i).toByte())\n`;
                code += `                }\n`;
                code += `            }\n`;
                break;
            default:
                code += `            // TODO: 处理 ${fieldType} 类型的 ${fieldName} 字段\n`;
                break;
        }
        
        if (index < fields.length - 1) {
            code += `\n`;
        }
    });
    
    return code;
}

// 生成 toJsonByteArray 方法的具体实现
function generateToJsonCode(fields) {
    let code = '';
    
    fields.forEach((field, index) => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        switch (fieldType) {
            case 'String':
                code += `            ${fieldName}?.let { jsonObject.put("${fieldName}", it) }\n`;
                break;
            case 'Int':
            case 'Int3':
            case 'Int2':
            case 'Int1':
            case 'Long':
            case 'Short':
            case 'Byte':
            case 'Boolean':
            case 'Float':
            case 'Double':
                code += `            jsonObject.put("${fieldName}", ${fieldName})\n`;
                break;
            case 'ByteArray':
                code += `            ${fieldName}?.let {\n`;
                code += `                jsonObject.put("${fieldName}", Base64.encodeToString(it, Base64.DEFAULT))\n`;
                code += `            }\n`;
                break;
            case 'MutableList<String>':
                code += `            ${fieldName}?.let {\n`;
                code += `                val ${fieldName}Array = JSONArray()\n`;
                code += `                it.forEach { item -> ${fieldName}Array.put(item) }\n`;
                code += `                jsonObject.put("${fieldName}", ${fieldName}Array)\n`;
                code += `            }\n`;
                break;
            case 'MutableList<Int>':
            case 'MutableList<Int3>':
            case 'MutableList<Int2>':
            case 'MutableList<Int1>':
            case 'MutableList<Byte>':
                code += `            ${fieldName}?.let {\n`;
                code += `                val ${fieldName}Array = JSONArray()\n`;
                code += `                it.forEach { item -> ${fieldName}Array.put(item) }\n`;
                code += `                jsonObject.put("${fieldName}", ${fieldName}Array)\n`;
                code += `            }\n`;
                break;
            default:
                code += `            // TODO: 处理 ${fieldType} 类型的 ${fieldName} 字段\n`;
                break;
        }
        
        if (index < fields.length - 1) {
            code += `\n`;
        }
    });
    
    return code;
}

// 简单的代码美化函数 - 只处理基本格式问题，不破坏原有结构
function beautifyCode(code) {
    if (!code || typeof code !== 'string') {
        return code;
    }
    
    // 只做最基本的清理，保持原有格式
    return code
        // 移除行尾多余空格
        .replace(/[ \t]+$/gm, '')
        // 统一换行符
        .replace(/\r\n/g, '\n')
        // 移除文件开头和结尾的多余换行
        .trim();
}

// 确保代码输出区域有正确的样式
function ensureCodeOutputStyles() {
    const outputElements = [
        'generatedCode',
        'reqClassCode', 
        'rspClassCode',
        'dartReqClassCode',
        'dartRspClassCode',
        'clientServiceCode',
        'serverServiceCode'
    ];
    
    outputElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // 强制应用样式
            element.style.backgroundColor = '#1e1e1e';
            element.style.color = '#d4d4d4';
            element.style.fontFamily = '"Fira Code", "Cascadia Code", "JetBrains Mono", "Courier New", monospace';
            element.style.whiteSpace = 'pre-wrap';
            element.style.padding = '20px';
            element.style.borderRadius = '8px';
            element.style.border = '2px solid #e1e5e9';
            element.style.fontSize = '14px';
            element.style.lineHeight = '1.5';
            element.style.maxHeight = '400px';
            element.style.overflowY = 'auto';
            element.style.tabSize = '4';
            element.style.display = 'block';
            element.style.width = '100%';
            element.style.boxSizing = 'border-box';
        }
    });
}

// 初始化Tab功能
function initializeTabs() {
    // 确保默认tab是激活状态
    const defaultTab = document.querySelector('.tab.active');
    const defaultContent = document.querySelector('.tab-content.active');
    
    if (!defaultTab || !defaultContent) {
        // 如果没有默认激活的tab，激活第一个
        const firstTab = document.querySelector('.tab');
        const firstContent = document.querySelector('.tab-content');
        
        if (firstTab && firstContent) {
            // 清除所有active状态
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // 激活第一个tab
            firstTab.classList.add('active');
            firstContent.classList.add('active');
        }
    }
    
    // 为所有tab按钮添加事件监听器（防止onclick失效）
    document.querySelectorAll('.tab').forEach((tab, index) => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabContentIds = [
                'enumCode', 'reqClassCode', 'rspClassCode', 
                'dartReqClassCode', 'dartRspClassCode', 
                'clientServiceCode', 'serverServiceCode'
            ];
            
            if (tabContentIds[index]) {
                switchTab(tabContentIds[index], this);
            }
        });
    });
}

// 页面加载完成后确保样式正确
document.addEventListener('DOMContentLoaded', function() {
    ensureCodeOutputStyles();
    initializeTabs();
    
    // 监听代码更新，确保样式始终正确
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                ensureCodeOutputStyles();
            }
        });
    });
    
    // 监听所有代码输出区域的变化
    const outputElements = [
        'generatedCode',
        'reqClassCode', 
        'rspClassCode',
        'dartReqClassCode',
        'dartRspClassCode',
        'clientServiceCode',
        'serverServiceCode'
    ];
    
    outputElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            observer.observe(element, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }
    });
}); 