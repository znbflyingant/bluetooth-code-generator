// 工具函数和事件监听器

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
    try {
        const activeTab = document.querySelector('.tab-content.active');
        if (!activeTab) {
            throw new Error('没有找到活动的标签页。请确保已经生成了代码。');
        }
        
        // 尝试多种方式找到代码输出元素
        let codeElement = activeTab.querySelector('.output');
        if (!codeElement) {
            codeElement = activeTab.querySelector('pre');
        }
        if (!codeElement) {
            codeElement = activeTab.querySelector('pre.output');
        }
        
        if (!codeElement) {
            console.error('无法找到代码输出元素，活动标签页:', activeTab);
            throw new Error('没有找到代码输出元素。请刷新页面重试。');
        }
        
        const text = codeElement.textContent || codeElement.innerText;
        if (!text || text.trim() === '' || text.includes('点击"生成代码"按钮开始生成') || text.includes('代码将在这里显示')) {
            throw new Error('没有可复制的代码内容。请先点击"生成代码"按钮。');
        }
        
        // 优先使用现代的 Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showCopySuccess();
            }).catch(err => {
                console.error('Clipboard API 复制失败:', err);
                fallbackCopyTextToClipboard(text);
            });
        } else {
            // 回退到传统方法
            console.log('使用传统复制方法');
            fallbackCopyTextToClipboard(text);
        }
    } catch (err) {
        console.error('复制操作失败:', err);
        alert('复制失败: ' + err.message);
    }
}

// 传统的复制方法（兼容旧浏览器）
function fallbackCopyTextToClipboard(text) {
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // 避免滚动到底部
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            showCopySuccess();
        } else {
            throw new Error('execCommand 复制失败');
        }
    } catch (err) {
        console.error('传统复制方法失败:', err);
        alert('复制失败，请手动复制代码');
    }
}

// 显示复制成功状态
function showCopySuccess() {
    const btn = document.getElementById('copyBtn');
    if (btn) {
        const originalText = btn.textContent;
        const originalBackground = btn.style.background;
        
        btn.textContent = '✅ 已复制';
        btn.style.background = '#28a745';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.textContent = '📋 复制当前代码';
            btn.style.background = originalBackground || '#28a745';
            btn.disabled = false;
        }, 2000);
    }
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
            case 'MutableList<ByteArray>':
                code += `            val ${fieldName}Array = jsonObject.optJSONArray("${fieldName}")\n`;
                code += `            if (${fieldName}Array != null) {\n`;
                code += `                ${fieldName} = mutableListOf()\n`;
                code += `                for (i in 0 until ${fieldName}Array.length()) {\n`;
                code += `                    val base64String = ${fieldName}Array.optString(i)\n`;
                code += `                    if (base64String.isNotEmpty()) {\n`;
                code += `                        ${fieldName}?.add(Base64.decode(base64String, Base64.DEFAULT))\n`;
                code += `                    }\n`;
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
            case 'MutableList<ByteArray>':
                code += `            ${fieldName}?.let {\n`;
                code += `                val ${fieldName}Array = JSONArray()\n`;
                code += `                it.forEach { item -> ${fieldName}Array.put(Base64.encodeToString(item, Base64.DEFAULT)) }\n`;
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
        'reqClassCodeOutput', 
        'rspClassCodeOutput',
        'dartReqClassCodeOutput',
        'dartRspClassCodeOutput',

        'reqJsonTestDataOutput',
        'rspJsonTestDataOutput'
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
                'swiftReqClassCode', 'swiftRspClassCode',
                'reqJsonTestData', 'rspJsonTestData'
            ];
            
            if (tabContentIds[index]) {
                switchTab(tabContentIds[index], this);
            }
        });
    });
}

// 添加标签页滚轮支持
function addTabsScrollSupport() {
    const tabsContainer = document.querySelector('.output-tabs');
    if (tabsContainer) {
        tabsContainer.addEventListener('wheel', function(e) {
            // 阻止默认的垂直滚动
            if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
                e.preventDefault();
                // 将垂直滚动转换为水平滚动
                tabsContainer.scrollLeft += e.deltaY;
            }
        }, { passive: false });

        // 添加键盘导航支持
        tabsContainer.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    tabsContainer.scrollLeft -= 100;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    tabsContainer.scrollLeft += 100;
                    break;
                case 'Home':
                    e.preventDefault();
                    tabsContainer.scrollLeft = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    tabsContainer.scrollLeft = tabsContainer.scrollWidth;
                    break;
            }
        });

        // 使标签页容器可以获得焦点（用于键盘导航）
        tabsContainer.setAttribute('tabindex', '0');
        
        // 添加视觉焦点指示器
        tabsContainer.style.outline = 'none';
        tabsContainer.addEventListener('focus', function() {
            this.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.3)';
        });
        tabsContainer.addEventListener('blur', function() {
            this.style.boxShadow = 'none';
        });
    }
}

// 页面加载完成后确保样式正确
document.addEventListener('DOMContentLoaded', function() {
    ensureCodeOutputStyles();
    initializeTabs();
    addTabsScrollSupport();
    
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
        'reqClassCodeOutput', 
        'rspClassCodeOutput',
        'dartReqClassCodeOutput',
        'dartRspClassCodeOutput',
        'swiftReqClassCodeOutput',
        'swiftRspClassCodeOutput',

        'reqJsonTestDataOutput',
        'rspJsonTestDataOutput'
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