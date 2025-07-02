/**
 * MainCmd 配置枚举定义
 * 蓝牙命令代码生成器 - 主命令配置
 * 
 * @author Auto Generated
 * @version 1.1.0
 * @date 2024-12-19
 */

/**
 * 主命令枚举配置
 * 每个配置项包含：
 * - value: 命令值
 * - enumType: 对应的枚举类型
 * - description: 描述信息

 * - hexCode: 十六进制命令号
 */
const MainCmdConfig = {
    // WiFi设置相关命令
    WIFI_SETTING: {
        value: 'MainCmd.wifiSetting',
        enumType: 'WifiSettingCmdEnum',
        description: 'WiFi设置相关命令',

        hexCode: '0x01'
    },
    
    // AI资源相关命令
    AI_RES: {
        value: 'MainCmd.aiRes',
        enumType: 'AiResEnum',
        description: 'AI资源相关命令',

        hexCode: '0x02'
    },
    
    // AI播放相关命令
    AI_PLAY: {
        value: 'MainCmd.aiPlay',
        enumType: 'AiPlayEnum',
        description: 'AI播放相关命令',

        hexCode: '0x03'
    },
    cmd0: {
        value: 'MainCmd.cmd0',
        enumType: 'Cmd0Enum',
        description: '',

        hexCode: '0x00'
    },
    cmd1: {
        value: 'MainCmd.cmd1',
        enumType: 'Cmd1Enum',
        description: '',

        hexCode: '0x01'
    },
    cmd2: {
        value: 'MainCmd.cmd2',
        enumType: 'Cmd2Enum',
        description: '',

        hexCode: '0x02'
    },
    cmd3: {
        value: 'MainCmd.cmd3',
        enumType: 'Cmd3Enum',
        description: '',

        hexCode: '0x03'
    },
    cmd4: {
        value: 'MainCmd.cmd4',
        enumType: 'Cmd4Enum',
        description: '',

        hexCode: '0x04'
    },
    cmd5: {
        value: 'MainCmd.cmd5',
        enumType: 'Cmd5Enum',
        description: '',

        hexCode: '0x05'
    },  
    cmd6: {
        value: 'MainCmd.cmd6',
        enumType: 'Cmd6Enum',
        description: '',

        hexCode: '0x06'
    },
    cmd7: {
        value: 'MainCmd.cmd7',
        enumType: 'Cmd7Enum',
        description: '',

        hexCode: '0x07'
    },
    cmd8: {
        value: 'MainCmd.cmd8',
        enumType: 'Cmd8Enum',
        description: '',

        hexCode: '0x08'
    },
    cmd9: {
        value: 'MainCmd.cmd9',
        enumType: 'Cmd9Enum',
        description: '',

        hexCode: '0x09'
    },
    aiRes: {
        value: 'MainCmd.aiRes',
        enumType: 'AiResEnum',
        description: '',

        hexCode: '0x0A'
    },
    aiPlay: {
        value: 'MainCmd.aiPlay',
        enumType: 'AiPlayEnum',
        description: '',

        hexCode: '0x0B'
    },
    aifsRes: {
        value: 'MainCmd.aifsRes',
        enumType: 'AifsResEnum',
        description: '',

        hexCode: '0x0C'
    },
    aifsPlay: {
        value: 'MainCmd.aifsPlay',
        enumType: 'AifsPlayEnum',
        description: '',

        hexCode: '0x0D'
    },
};

/**
 * 获取所有主命令选项
 * @returns {Array} 主命令选项数组
 */
function getMainCmdOptions() {
    return Object.values(MainCmdConfig);
}

/**
 * 根据值获取主命令配置
 * @param {string} value - 命令值
 * @returns {Object|null} 主命令配置对象
 */
function getMainCmdByValue(value) {
    return Object.values(MainCmdConfig).find(cmd => cmd.value === value) || null;
}

/**
 * 根据枚举类型获取主命令配置
 * @param {string} enumType - 枚举类型
 * @returns {Object|null} 主命令配置对象
 */
function getMainCmdByEnumType(enumType) {
    return Object.values(MainCmdConfig).find(cmd => cmd.enumType === enumType) || null;
}



/**
 * 根据十六进制命令号获取主命令配置
 * @param {string} hexCode - 十六进制命令号 (如: '0x01')
 * @returns {Object|null} 主命令配置对象
 */
function getMainCmdByHexCode(hexCode) {
    return Object.values(MainCmdConfig).find(cmd => cmd.hexCode === hexCode) || null;
}

/**
 * 获取所有十六进制命令号
 * @returns {Array} 十六进制命令号数组
 */
function getAllHexCodes() {
    return Object.values(MainCmdConfig).map(cmd => cmd.hexCode);
}

/**
 * 将十六进制命令号转换为十进制
 * @param {string} hexCode - 十六进制命令号 (如: '0x01')
 * @returns {number} 十进制数值
 */
function hexToDecimal(hexCode) {
    return parseInt(hexCode, 16);
}

/**
 * 将十进制转换为十六进制命令号
 * @param {number} decimal - 十进制数值
 * @returns {string} 十六进制命令号 (如: '0x01')
 */
function decimalToHex(decimal) {
    return '0x' + decimal.toString(16).padStart(2, '0').toUpperCase();
}

/**
 * 动态生成MainCmd下拉选项
 * @param {string} selectId - select元素的ID
 * @param {string} defaultValue - 默认选中值（如果为空，则选中第一个选项）
 */
function populateMainCmdSelect(selectId = 'mainCmd', defaultValue = '') {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) {
        console.error(`找不到ID为 ${selectId} 的select元素`);
        return;
    }
    
    // 清空现有选项
    selectElement.innerHTML = '';
    
    // 获取所有主命令选项
    const cmdOptions = getMainCmdOptions();
    
    // 添加所有主命令选项
    cmdOptions.forEach((cmd, index) => {
        const option = document.createElement('option');
        option.value = cmd.value;
        option.textContent = `${cmd.enumType} [${cmd.hexCode}]`;
        
        // 设置默认选中：如果有指定defaultValue则使用，否则选中第一个选项
        if (defaultValue && cmd.value === defaultValue) {
            option.selected = true;
        } else if (!defaultValue && index === 0) {
            option.selected = true;
        }
        
        selectElement.appendChild(option);
    });
    
    // 如果选中了第一个选项，触发change事件
    if (!defaultValue && cmdOptions.length > 0) {
        const firstCmd = cmdOptions[0];
        if (typeof onMainCmdChange === 'function') {
            onMainCmdChange(firstCmd.value);
        }
    }
}

/**
 * 当MainCmd选择改变时的处理函数
 * @param {string} selectedValue - 选中的值
 */
function onMainCmdChange(selectedValue) {
    const cmdConfig = getMainCmdByValue(selectedValue);
    if (cmdConfig) {

        
        // 显示enumType信息
        const enumTypeElement = document.getElementById('enumType');
        if (enumTypeElement) {
            enumTypeElement.value = cmdConfig.enumType;
        }
        
        // 显示hexCode信息
        const hexCodeElement = document.getElementById('hexCode');
        if (hexCodeElement) {
            hexCodeElement.value = cmdConfig.hexCode;
        }
        
        // 如果有显示区域，也可以更新显示文本
        const mainCmdInfoElement = document.getElementById('mainCmdInfo');
        if (mainCmdInfoElement) {
            mainCmdInfoElement.innerHTML = `
                <div><strong>枚举类型:</strong> ${cmdConfig.enumType}</div>
                <div><strong>命令号:</strong> ${cmdConfig.hexCode} (十进制: ${hexToDecimal(cmdConfig.hexCode)})</div>
                <div><strong>描述:</strong> ${cmdConfig.description}</div>

            `;
        }
        
        console.log('MainCmd changed:', {
            value: cmdConfig.value,
            enumType: cmdConfig.enumType,

            description: cmdConfig.description,
            hexCode: cmdConfig.hexCode,
            decimalCode: hexToDecimal(cmdConfig.hexCode)
        });
    } else {
        // 清空显示信息
        const enumTypeElement = document.getElementById('enumType');
        if (enumTypeElement) {
            enumTypeElement.value = '';
        }
        
        const hexCodeElement = document.getElementById('hexCode');
        if (hexCodeElement) {
            hexCodeElement.value = '';
        }
        
        const mainCmdInfoElement = document.getElementById('mainCmdInfo');
        if (mainCmdInfoElement) {
            mainCmdInfoElement.innerHTML = '';
        }
    }
}

// 导出配置和函数供其他模块使用
if (typeof window !== 'undefined') {
    // 浏览器环境
    window.MainCmdConfig = MainCmdConfig;
    window.getMainCmdOptions = getMainCmdOptions;
    window.getMainCmdByValue = getMainCmdByValue;
    window.getMainCmdByEnumType = getMainCmdByEnumType;
    window.getMainCmdByHexCode = getMainCmdByHexCode;

    window.getAllHexCodes = getAllHexCodes;
    window.hexToDecimal = hexToDecimal;
    window.decimalToHex = decimalToHex;
    window.populateMainCmdSelect = populateMainCmdSelect;
    window.onMainCmdChange = onMainCmdChange;
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = {
        MainCmdConfig,
        getMainCmdOptions,
        getMainCmdByValue,
        getMainCmdByEnumType,
        getMainCmdByHexCode,

        getAllHexCodes,
        hexToDecimal,
        decimalToHex,
        populateMainCmdSelect,
        onMainCmdChange
    };
} 