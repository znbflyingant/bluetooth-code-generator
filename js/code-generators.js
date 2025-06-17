// 代码生成器相关函数

// 生成字段注释
function generateFieldComment(fieldType, field) {
    const baseComments = {
        'Int': '4字节整数类型，JSON中为数字',
        'Int3': '3字节整数类型，使用 CmdHelper.int3ToByte 转换（节省空间，范围: 0-16,777,215），JSON中为数字',
        'Int2': '2字节整数类型，使用 CmdHelper.int2ToByte 转换（节省空间，范围: 0-65,535），JSON中为数字',
        'Int1': '1字节整数类型，使用 CmdHelper.int1ToByte 转换（节省空间，范围: 0-255），JSON中为数字',
        'Long': '长整数类型，使用 CmdHelper.longToByte 转换，JSON中为数字',
        'Short': '短整数类型，使用 CmdHelper.shortToByte 转换，JSON中为数字',
        'Byte': '字节类型，直接转换，JSON中为数字',
        'Boolean': '布尔类型，转换为 0/1 字节，JSON中为布尔值',
        'Float': '单精度浮点类型，使用 CmdHelper.floatToByte 转换，JSON中为数字',
        'Double': '双精度浮点类型，使用 CmdHelper.doubleToByte 转换，JSON中为数字',
        'ByteArray': '字节数组，自动处理长度前缀，JSON中使用Base64编码',
        'MutableList<Int>': '可变4字节整数列表，JSON中为数字数组',
        'MutableList<Int3>': '可变3字节整数列表，节省空间，JSON中为数字数组',
        'MutableList<Int2>': '可变2字节整数列表，节省空间，JSON中为数字数组',
        'MutableList<Int1>': '可变1字节整数列表，节省空间，JSON中为数字数组',
        'MutableList<Byte>': '可变字节列表，JSON中为数字数组'
    };
    
    // 处理字符串类型的特殊注释
    if (fieldType === 'String') {
        const lengthBytes = field.stringLengthBytes || 1;
        const maxLength = Math.pow(256, lengthBytes) - 1;
        return `字符串类型，使用${lengthBytes}字节长度前缀(最大${maxLength}字符)，JSON中为字符串`;
    }
    
    // 处理字符串列表类型的特殊注释
    if (fieldType === 'MutableList<String>') {
        const lengthBytes = field.stringLengthBytes || 1;
        const maxLength = Math.pow(256, lengthBytes) - 1;
        return `可变字符串列表，每个字符串使用${lengthBytes}字节长度前缀(最大${maxLength}字符)，JSON中为字符串数组`;
    }
    
    return baseComments[fieldType] || `${fieldType} 类型字段`;
}

// 生成 Kotlin 类代码
function generateClassCode(className, fields = [], isReq = true, enumBaseName = '', enumType = 'AiResEnum') {
    const packageName = 'com.tempolor.aimusic.proto.aires';
    
    if (isReq) {
        // 生成 Req 类
        let code = `

import com.tempolor.aimusic.base.LogHelper
import com.tempolor.aimusic.proto.base.CommonProtoBase
import com.tempolor.aimusic.proto.base.utils.CmdHelper
import com.tempolor.aimusic.proto.cmd.${enumType}
import org.json.JSONObject
import org.json.JSONArray

class ${className} : CommonProtoBase() {
    @Transient
    val TAG = "${className}"
`;

        // 添加字段定义
        if (fields.length > 0) {
            fields.forEach(field => {
                let actualType = field.type;
                
                // 处理特殊的int类型
                if (actualType === 'Int3' || actualType === 'Int2' || actualType === 'Int1') {
                    actualType = 'Int';
                }
                // 处理列表中的特殊int类型
                else if (actualType === 'MutableList<Int3>' || actualType === 'MutableList<Int2>' || actualType === 'MutableList<Int1>') {
                    actualType = 'MutableList<Int>';
                }
                
                // 添加字段注释
                code += `    // ${generateFieldComment(field.type, field)}\n`;
                code += `    var ${field.name}: ${actualType}? = null\n`;
            });
        }

        // 生成 fromByteArray 方法
        code += `
    override fun fromByteArrayByteType(byteArray: ByteArray) {
        try {
            if (byteArray.size > 0) {
`;

        if (fields.length > 0) {
            code += generateFromByteArrayCode(fields);
        }

        code += `            }
        } catch (e: Exception) {
            LogHelper.e(TAG, e.toString())
        }
    }

    override fun toByteArrayByteType(): ByteArray {
`;

        if (fields.length > 0) {
            code += generateToByteArrayCode(fields);
        } else {
            code += `        return byteArrayOf()`;
        }

        code += `
    }

    override fun getCmd(): ByteArray {
        return ${enumType}.${enumBaseName}ReqCmd.getCmd()
    }

    override fun fromByteArrayJsonType(byteArray: ByteArray) {
        try {
            val jsonString = byteArray.decodeToString()
            val jsonObject = JSONObject(jsonString)
            
${fields.length > 0 ? generateFromJsonCode(fields) : ''}
        } catch (e: Exception) {
            LogHelper.e(TAG, "fromJsonByteArray error: \${e.toString()}")
        }
    }

    override fun toByteArrayJsonType(): ByteArray {
        return try {
            val jsonObject = JSONObject()
            
${fields.length > 0 ? generateToJsonCode(fields) : ''}
            
            jsonObject.toString().toByteArray()
        } catch (e: Exception) {
            LogHelper.e(TAG, "toJsonByteArray error: \${e.toString()}")
            byteArrayOf()
        }
    }

    override fun fromByteArray(byteArray: ByteArray) {
        fromByteArrayByteType(byteArray)
    }

    override fun toByteArray(): ByteArray {
        return toByteArrayByteType()
    }
}`;
        return code;
    } else {
        // 生成 Rsp 类
        let code = `

import com.tempolor.aimusic.base.LogHelper
import com.tempolor.aimusic.proto.base.CommonProtoRsp
import com.tempolor.aimusic.proto.base.utils.CmdHelper
import com.tempolor.aimusic.proto.cmd.${enumType}
import org.json.JSONObject
import org.json.JSONArray

class ${className} : CommonProtoRsp() {
    override val TAG = "${className}"
`;

        // 添加字段定义
        if (fields.length > 0) {
            fields.forEach(field => {
                let actualType = field.type;
                
                // 处理特殊的int类型
                if (actualType === 'Int3' || actualType === 'Int2' || actualType === 'Int1') {
                    actualType = 'Int';
                }
                // 处理列表中的特殊int类型
                else if (actualType === 'MutableList<Int3>' || actualType === 'MutableList<Int2>' || actualType === 'MutableList<Int1>') {
                    actualType = 'MutableList<Int>';
                }
                
                // 添加字段注释
                code += `    // ${generateFieldComment(field.type, field)}\n`;
                code += `    var ${field.name}: ${actualType}? = null\n`;
            });
        }

        // 生成 fromByteArray 方法
        code += `
    override fun fromByteArrayByteType(byteArray: ByteArray) {
        try {
            if (byteArray.size > 0) {
`;

        if (fields.length > 0) {
            code += generateFromByteArrayCode(fields);
        }

        code += `            }
        } catch (e: Exception) {
            LogHelper.e(TAG, e.toString())
        }
    }

    override fun toByteArrayByteType(): ByteArray {
`;

        if (fields.length > 0) {
            code += generateToByteArrayCode(fields);
        } else {
            code += `        return byteArrayOf()`;
        }

        code += `
    }

    override fun getCmd(): ByteArray {
        return ${enumType}.${enumBaseName}RspCmd.getCmd()
    }

    override fun fromByteArrayJsonType(byteArray: ByteArray) {
        try {
            val jsonString = byteArray.decodeToString()
            val jsonObject = JSONObject(jsonString)
            
${fields.length > 0 ? generateFromJsonCode(fields) : ''}
        } catch (e: Exception) {
            LogHelper.e(TAG, "fromJsonByteArray error: \${e.toString()}")
        }
    }

    override fun toByteArrayJsonType(): ByteArray {
        return try {
            val jsonObject = JSONObject()
            
${fields.length > 0 ? generateToJsonCode(fields) : ''}
            
            jsonObject.toString().toByteArray()
        } catch (e: Exception) {
            LogHelper.e(TAG, "toJsonByteArray error: \${e.toString()}")
            byteArrayOf()
        }
    }

    override fun fromByteArray(byteArray: ByteArray) {
        fromByteArrayByteType(byteArray)
    }

    override fun toByteArray(): ByteArray {
        return toByteArrayByteType()
    }
}`;
        return code;
    }
} 