/**
 * SubCmd 配置枚举定义
 * 蓝牙命令代码生成器 - 子命令配置
 * 
 * @author Auto Generated
 * @version 1.0.0
 * @date 2024-12-19
 */

/**
 * 子命令配置数组
 * 每个配置项包含：
 * - decimal: 十进制值
 * - hex: 十六进制值
 * - display: 显示文本
 */
const SubCmdConfig = [];

// 生成0到20的十六进制配置
for (let i = 0; i <= 255; i++) {
    const hexValue = '0x' + i.toString(16).padStart(2, '0').toUpperCase();
    SubCmdConfig.push({
        decimal: i,
        hex: hexValue,
        display: `${i} (${hexValue})`
    });
}

/**
 * 获取所有子命令选项
 * @returns {Array} 子命令选项数组
 */
function getSubCmdOptions() {
    return SubCmdConfig;
}

/**
 * 根据十进制值获取子命令配置
 * @param {number} decimal - 十进制值
 * @returns {Object|null} 子命令配置对象
 */
function getSubCmdByDecimal(decimal) {
    return SubCmdConfig.find(cmd => cmd.decimal === decimal) || null;
}

/**
 * 根据十六进制值获取子命令配置
 * @param {string} hex - 十六进制值 (如: '0x01')
 * @returns {Object|null} 子命令配置对象
 */
function getSubCmdByHex(hex) {
    return SubCmdConfig.find(cmd => cmd.hex === hex) || null;
}

/**
 * 动态生成SubCmd下拉选项
 * @param {string} selectId - select元素的ID
 * @param {number} defaultValue - 默认选中值（十进制）
 */
function populateSubCmdSelect(selectId = 'subCmd', defaultValue = 0) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) {
        console.error(`找不到ID为 ${selectId} 的select元素`);
        return;
    }
    
    // 清空现有选项
    selectElement.innerHTML = '';
    
    // 获取所有子命令选项
    const cmdOptions = getSubCmdOptions();
    
    // 添加所有子命令选项
    cmdOptions.forEach((cmd, index) => {
        const option = document.createElement('option');
        option.value = cmd.decimal; // 使用十进制值作为value
        option.textContent = cmd.display;
        
        // 设置默认选中：如果指定了defaultValue则选中对应项，否则选中第一个选项
        if (cmd.decimal === defaultValue) {
            option.selected = true;
        } else if (defaultValue === undefined && index === 0) {
            option.selected = true;
        }
        
        selectElement.appendChild(option);
    });
}

/**
 * 当SubCmd选择改变时的处理函数
 * @param {string} selectedValue - 选中的值（字符串形式的十进制）
 */
function onSubCmdChange(selectedValue) {
    const decimal = parseInt(selectedValue);
    const cmdConfig = getSubCmdByDecimal(decimal);
    
    if (cmdConfig) {
        console.log('SubCmd changed:', {
            decimal: cmdConfig.decimal,
            hex: cmdConfig.hex,
            display: cmdConfig.display
        });
        
        // 可以在这里添加其他联动逻辑
        // 例如更新某个显示区域的信息
        const subCmdInfoElement = document.getElementById('subCmdInfo');
        if (subCmdInfoElement) {
            subCmdInfoElement.innerHTML = `
                <div><strong>十进制:</strong> ${cmdConfig.decimal}</div>
                <div><strong>十六进制:</strong> ${cmdConfig.hex}</div>
            `;
        }
    }
}

/**
 * 获取当前选中的SubCmd配置
 * @param {string} selectId - select元素的ID
 * @returns {Object|null} 当前选中的子命令配置对象
 */
function getCurrentSubCmd(selectId = 'subCmd') {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) {
        return null;
    }
    
    const selectedValue = parseInt(selectElement.value);
    return getSubCmdByDecimal(selectedValue);
}

// 导出配置和函数供其他模块使用
if (typeof window !== 'undefined') {
    // 浏览器环境
    window.SubCmdConfig = SubCmdConfig;
    window.getSubCmdOptions = getSubCmdOptions;
    window.getSubCmdByDecimal = getSubCmdByDecimal;
    window.getSubCmdByHex = getSubCmdByHex;
    window.populateSubCmdSelect = populateSubCmdSelect;
    window.onSubCmdChange = onSubCmdChange;
    window.getCurrentSubCmd = getCurrentSubCmd;
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = {
        SubCmdConfig,
        getSubCmdOptions,
        getSubCmdByDecimal,
        getSubCmdByHex,
        populateSubCmdSelect,
        onSubCmdChange,
        getCurrentSubCmd
    };
} 