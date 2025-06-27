// 字段管理相关函数

// 添加字段
function addField(type) {
    const fieldListId = type === 'req' ? 'reqFieldList' : 'rspFieldList';
    const fieldList = document.getElementById(fieldListId);
    
    const fieldItem = document.createElement('div');
    fieldItem.className = 'field-item';
    
    fieldItem.innerHTML = `
        <div class="field-inputs" style="display: flex; align-items: center; gap: 10px; width: 100%;">
            <input type="text" placeholder="字段名" class="field-name" style="padding: 8px; font-size: 12px; flex: 1; min-width: 120px;">
            <select class="field-type" style="padding: 8px; font-size: 12px; flex: 2; min-width: 200px;">
                <option value="">选择类型</option>
                <optgroup label="🔤 字符串类型">
                    <option value="String:1">String (1字节长度) - 最大255字符</option>
                    <option value="String:2">String (2字节长度) - 最大65535字符</option>
                    <option value="String:3">String (3字节长度) - 最大16777215字符</option>
                    <option value="String:4">String (4字节长度) - 最大4294967295字符</option>
                </optgroup>
                <optgroup label="🔢 数值类型">
                    <option value="Int">Int (4字节)</option>
                    <option value="Int3">Int3 (3字节)</option>
                    <option value="Int2">Int2 (2字节)</option>
                    <option value="Int1">Int1 (1字节)</option>
                    <option value="Long">Long</option>
                    <option value="Short">Short</option>
                    <option value="Byte">Byte</option>
                    <option value="Float">Float</option>
                    <option value="Double">Double</option>
                </optgroup>
                <optgroup label="✅ 其他类型">
                    <option value="Boolean">Boolean</option>
                    <option value="ByteArray">ByteArray</option>
                </optgroup>
                <optgroup label="📄 字符串列表">
                    <option value="MutableList<String>:1">MutableList&lt;String&gt; (1字节长度)</option>
                    <option value="MutableList<String>:2">MutableList&lt;String&gt; (2字节长度)</option>
                    <option value="MutableList<String>:3">MutableList&lt;String&gt; (3字节长度)</option>
                    <option value="MutableList<String>:4">MutableList&lt;String&gt; (4字节长度)</option>
                </optgroup>
                <optgroup label="📊 数值列表">
                    <option value="MutableList<Int>">MutableList&lt;Int&gt;</option>
                    <option value="MutableList<Int3>">MutableList&lt;Int3&gt;</option>
                    <option value="MutableList<Int2>">MutableList&lt;Int2&gt;</option>
                    <option value="MutableList<Int1>">MutableList&lt;Int1&gt;</option>
                    <option value="MutableList<Byte>">MutableList&lt;Byte&gt;</option>
                </optgroup>
            </select>
            <button type="button" class="remove-field" onclick="removeField(this)" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; font-size: 14px; font-weight: bold; flex-shrink: 0;">×</button>
        </div>
    `;
    
    fieldList.appendChild(fieldItem);
    
    // 拖拽功能已屏蔽
    // setTimeout(() => {
    //     initializeFieldDragSort(fieldList);
    // }, 10);
}

// 移除字段
function removeField(button) {
    // 找到字段项容器并删除
    const fieldItem = button.closest('.field-item');
    if (fieldItem) {
        fieldItem.remove();
    }
}

// 清空所有字段
function clearAllFields(type) {
    const fieldListId = type === 'req' ? 'reqFieldList' : 'rspFieldList';
    const fieldList = document.getElementById(fieldListId);
    if (fieldList) {
        fieldList.innerHTML = '';
    }
}

// 从字段列表获取字段数据
function getFieldsFromList(type) {
    const fieldListId = type === 'req' ? 'reqFieldList' : 'rspFieldList';
    const fieldList = document.getElementById(fieldListId);
    const fieldItems = fieldList.querySelectorAll('.field-item');
    const fields = [];
    
    fieldItems.forEach(item => {
        const nameInput = item.querySelector('.field-name');
        const typeSelect = item.querySelector('.field-type');
        
        if (nameInput.value.trim() && typeSelect.value) {
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
                console.log(`✅ 字段 ${field.name} (${fieldType}) 设置长度字节数: ${stringLengthBytes}`);
            }
            
            fields.push(field);
        }
    });
    
    return fields;
}



// 拖拽排序功能已屏蔽
// let draggedElement = null;
// let draggedFromContainer = null;

// 拖拽相关函数已屏蔽
// function initializeFieldDragSort(fieldList) { ... }
// function setupFieldListDropEvents(fieldList) { ... }
// function getDragAfterElement(container, y) { ... }

// 测试拖拽功能已屏蔽
// function testDragFunction() { ... }

// 拖拽功能初始化已屏蔽
// document.addEventListener('DOMContentLoaded', function() { ... }); 

// 一键添加所有字段类型
function addAllFieldTypes() {
    // 首先切换到自定义字段模板
    const templateTypeSelect = document.getElementById('templateType');
    if (templateTypeSelect) {
        templateTypeSelect.value = 'custom';
        // 触发change事件以显示自定义字段区域
        const changeEvent = new Event('change', { bubbles: true });
        templateTypeSelect.dispatchEvent(changeEvent);
    }
    
    // 延迟一点确保DOM更新完成
    setTimeout(() => {
        // 清空现有字段
        clearAllFields('req');
        clearAllFields('rsp');
        
        // 定义所有字段类型
        const allFieldTypes = [
            // 字符串类型
            { name: 'userName', type: 'String:2', displayName: 'String (2字节)' },
            { name: 'shortId', type: 'String:1', displayName: 'String (1字节)' },
            
            // 数值类型
            { name: 'userId', type: 'Int', displayName: 'Int' },
            { name: 'count', type: 'Int3', displayName: 'Int3' },
            { name: 'status', type: 'Int2', displayName: 'Int2' },
            { name: 'flag', type: 'Int1', displayName: 'Int1' },
            { name: 'timestamp', type: 'Long', displayName: 'Long' },
            { name: 'port', type: 'Short', displayName: 'Short' },
            { name: 'code', type: 'Byte', displayName: 'Byte' },
            { name: 'rate', type: 'Float', displayName: 'Float' },
            { name: 'value', type: 'Double', displayName: 'Double' },
            
            // 其他类型
            { name: 'isActive', type: 'Boolean', displayName: 'Boolean' },
            { name: 'data', type: 'ByteArray', displayName: 'ByteArray' },
            
            // 列表类型
            { name: 'nameList', type: 'MutableList<String>:2', displayName: 'MutableList<String>' },
            { name: 'idList', type: 'MutableList<Int>', displayName: 'MutableList<Int>' },
            { name: 'countList', type: 'MutableList<Int3>', displayName: 'MutableList<Int3>' },
            { name: 'statusList', type: 'MutableList<Int2>', displayName: 'MutableList<Int2>' },
            { name: 'flagList', type: 'MutableList<Int1>', displayName: 'MutableList<Int1>' },
            { name: 'byteList', type: 'MutableList<Byte>', displayName: 'MutableList<Byte>' }
        ];
        
        // 为Req添加所有字段类型
        allFieldTypes.forEach(field => {
            addFieldWithData('req', field.name, field.type);
        });
        
        // 为Rsp添加所有字段类型
        allFieldTypes.forEach(field => {
            addFieldWithData('rsp', field.name, field.type);
        });
        
        // 自动生成代码
        setTimeout(() => {
            if (typeof generateCode === 'function') {
                generateCode();
            }
        }, 200);
        
        // 显示提示信息
        console.log('🎯 已自动添加所有字段类型并生成代码！');
        alert('✅ 已自动添加所有字段类型并生成代码！\n\n📋 请查看"Req 测试JSON"和"Rsp 测试JSON"标签页查看生成的测试数据。');
        
    }, 100);
}

// 添加指定数据的字段
function addFieldWithData(type, fieldName, fieldType) {
    const fieldListId = type === 'req' ? 'reqFieldList' : 'rspFieldList';
    const fieldList = document.getElementById(fieldListId);
    
    const fieldItem = document.createElement('div');
    fieldItem.className = 'field-item';
    
    fieldItem.innerHTML = `
        <div class="field-inputs" style="display: flex; align-items: center; gap: 10px; width: 100%;">
            <input type="text" placeholder="字段名" class="field-name" style="padding: 8px; font-size: 12px; flex: 1; min-width: 120px;" value="${fieldName}">
            <select class="field-type" style="padding: 8px; font-size: 12px; flex: 2; min-width: 200px;">
                <option value="">选择类型</option>
                <optgroup label="🔤 字符串类型">
                    <option value="String:1">String (1字节长度) - 最大255字符</option>
                    <option value="String:2">String (2字节长度) - 最大65535字符</option>
                    <option value="String:3">String (3字节长度) - 最大16777215字符</option>
                    <option value="String:4">String (4字节长度) - 最大4294967295字符</option>
                </optgroup>
                <optgroup label="🔢 数值类型">
                    <option value="Int">Int (4字节)</option>
                    <option value="Int3">Int3 (3字节)</option>
                    <option value="Int2">Int2 (2字节)</option>
                    <option value="Int1">Int1 (1字节)</option>
                    <option value="Long">Long</option>
                    <option value="Short">Short</option>
                    <option value="Byte">Byte</option>
                    <option value="Float">Float</option>
                    <option value="Double">Double</option>
                </optgroup>
                <optgroup label="✅ 其他类型">
                    <option value="Boolean">Boolean</option>
                    <option value="ByteArray">ByteArray</option>
                </optgroup>
                <optgroup label="📄 字符串列表">
                    <option value="MutableList<String>:1">MutableList&lt;String&gt; (1字节长度)</option>
                    <option value="MutableList<String>:2">MutableList&lt;String&gt; (2字节长度)</option>
                    <option value="MutableList<String>:3">MutableList&lt;String&gt; (3字节长度)</option>
                    <option value="MutableList<String>:4">MutableList&lt;String&gt; (4字节长度)</option>
                </optgroup>
                <optgroup label="📊 数值列表">
                    <option value="MutableList<Int>">MutableList&lt;Int&gt;</option>
                    <option value="MutableList<Int3>">MutableList&lt;Int3&gt;</option>
                    <option value="MutableList<Int2>">MutableList&lt;Int2&gt;</option>
                    <option value="MutableList<Int1>">MutableList&lt;Int1&gt;</option>
                    <option value="MutableList<Byte>">MutableList&lt;Byte&gt;</option>
                </optgroup>
            </select>
            <button type="button" class="remove-field" onclick="removeField(this)" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; font-size: 14px; font-weight: bold; flex-shrink: 0;">×</button>
        </div>
    `;
    
    fieldList.appendChild(fieldItem);
    
    // 设置选中的字段类型
    const typeSelect = fieldItem.querySelector('.field-type');
    if (typeSelect) {
        typeSelect.value = fieldType;
    }
} 