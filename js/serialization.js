// 序列化相关函数

// 生成 fromByteArray 方法的具体实现
function generateFromByteArrayCode(fields) {
    let code = '';
    let position = 0;
    
    fields.forEach((field, index) => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        switch (fieldType) {
            case 'String':
                const stringLengthBytes = field.stringLengthBytes || 1;
                if (stringLengthBytes === 1) {
                    code += `                var ${fieldName}Size = (byteArray[${position}].toInt() and 0xFF)\n`;
                } else if (stringLengthBytes === 2) {
                    code += `                var ${fieldName}Size = CmdHelper.byte2ToInt(byteArray.sliceArray(${position}..${typeof position === 'string' ? `(${position} + 1)` : `${position + 1}`}))\n`;
                } else if (stringLengthBytes === 3) {
                    code += `                var ${fieldName}Size = CmdHelper.byte3ToInt(byteArray.sliceArray(${position}..${typeof position === 'string' ? `(${position} + 2)` : `${position + 2}`}))\n`;
                } else if (stringLengthBytes === 4) {
                    code += `                var ${fieldName}Size = CmdHelper.byte4ToInt(byteArray.sliceArray(${position}..${typeof position === 'string' ? `(${position} + 3)` : `${position + 3}`}))\n`;
                }
                code += `                if (${fieldName}Size > 0) {\n`;
                if (typeof position === 'string') {
                    code += `                    var ${fieldName}Bytes = byteArray.sliceArray((${position} + ${stringLengthBytes})..(${position} + ${stringLengthBytes} + ${fieldName}Size - 1))\n`;
                } else {
                    code += `                    var ${fieldName}Bytes = byteArray.sliceArray(${position + stringLengthBytes}..${position + stringLengthBytes} + ${fieldName}Size - 1)\n`;
                }
                code += `                    ${fieldName} = String(${fieldName}Bytes)\n`;
                code += `                }\n`;
                position = `${typeof position === 'string' ? position : position} + ${stringLengthBytes} + ${fieldName}Size`;
                break;
                
            case 'Int':
                code += `                ${fieldName} = CmdHelper.byteToInt(byteArray.sliceArray(${position}..${typeof position === 'string' ? `(${position} + 3)` : `${position + 3}`}))\n`;
                position = typeof position === 'string' ? `${position} + 4` : position + 4;
                break;
                
            case 'Int3':
                code += `                ${fieldName} = CmdHelper.byte3ToInt(byteArray.sliceArray(${position}..${typeof position === 'string' ? `(${position} + 2)` : `${position + 2}`}))\n`;
                position = typeof position === 'string' ? `${position} + 3` : position + 3;
                break;
                
            case 'Int2':
                code += `                ${fieldName} = CmdHelper.byte2ToInt(byteArray.sliceArray(${position}..${typeof position === 'string' ? `(${position} + 1)` : `${position + 1}`}))\n`;
                position = typeof position === 'string' ? `${position} + 2` : position + 2;
                break;
                
            case 'Int1':
                code += `                ${fieldName} = CmdHelper.byte1ToInt(byteArray.sliceArray(${position}..${position}))\n`;
                position = typeof position === 'string' ? `${position} + 1` : position + 1;
                break;
                
            case 'Long':
                code += `                ${fieldName} = CmdHelper.byteToLong(byteArray.sliceArray(${position}..${typeof position === 'string' ? `(${position} + 7)` : `${position + 7}`}))\n`;
                position = typeof position === 'string' ? `${position} + 8` : position + 8;
                break;
                
            case 'Short':
                code += `                ${fieldName} = CmdHelper.byteToShort(byteArray.sliceArray(${position}..${typeof position === 'string' ? `(${position} + 1)` : `${position + 1}`}))\n`;
                position = typeof position === 'string' ? `${position} + 2` : position + 2;
                break;
                
            case 'Byte':
                code += `                ${fieldName} = byteArray[${position}]\n`;
                position = typeof position === 'string' ? `${position} + 1` : position + 1;
                break;
                
            case 'Boolean':
                code += `                ${fieldName} = byteArray[${position}] != 0.toByte()\n`;
                position = typeof position === 'string' ? `${position} + 1` : position + 1;
                break;
                
            case 'Float':
                code += `                ${fieldName} = CmdHelper.byteToFloat(byteArray.sliceArray(${position}..${typeof position === 'string' ? `(${position} + 3)` : `${position + 3}`}))\n`;
                position = typeof position === 'string' ? `${position} + 4` : position + 4;
                break;
                
            case 'Double':
                code += `                ${fieldName} = CmdHelper.byteToDouble(byteArray.sliceArray(${position}..${typeof position === 'string' ? `(${position} + 7)` : `${position + 7}`}))\n`;
                position = typeof position === 'string' ? `${position} + 8` : position + 8;
                break;
                
            case 'ByteArray':
                code += `                var ${fieldName}Size = (byteArray[${position}].toInt() and 0xFF)\n`;
                code += `                if (${fieldName}Size > 0) {\n`;
                if (typeof position === 'string') {
                    code += `                    ${fieldName} = byteArray.sliceArray((${position} + 1)..(${position} + 1 + ${fieldName}Size - 1))\n`;
                } else {
                    code += `                    ${fieldName} = byteArray.sliceArray(${position + 1}..${position + 1} + ${fieldName}Size - 1)\n`;
                }
                code += `                }\n`;
                position = `${position} + 1 + ${fieldName}Size`;
                break;
                
            case 'MutableList<String>':
                const listStringLengthBytes = field.stringLengthBytes || 1;
                code += `                var ${fieldName}Count = (byteArray[${position}].toInt() and 0xFF)\n`;
                code += `                ${fieldName} = mutableListOf<String>()\n`;
                code += `                var ${fieldName}Position = ${position} + 1\n`;
                code += `                for (i in 0 until ${fieldName}Count) {\n`;
                if (listStringLengthBytes === 1) {
                    code += `                    var itemSize = (byteArray[${fieldName}Position].toInt() and 0xFF)\n`;
                } else if (listStringLengthBytes === 2) {
                    code += `                    var itemSize = CmdHelper.byte2ToInt(byteArray.sliceArray(${fieldName}Position..${fieldName}Position + 1))\n`;
                } else if (listStringLengthBytes === 3) {
                    code += `                    var itemSize = CmdHelper.byte3ToInt(byteArray.sliceArray(${fieldName}Position..${fieldName}Position + 2))\n`;
                } else if (listStringLengthBytes === 4) {
                    code += `                    var itemSize = CmdHelper.byte4ToInt(byteArray.sliceArray(${fieldName}Position..${fieldName}Position + 3))\n`;
                }
                code += `                    if (itemSize > 0) {\n`;
                code += `                        var itemBytes = byteArray.sliceArray(${fieldName}Position + ${listStringLengthBytes}..${fieldName}Position + ${listStringLengthBytes} + itemSize - 1)\n`;
                code += `                        ${fieldName}?.add(String(itemBytes))\n`;
                code += `                    }\n`;
                code += `                    ${fieldName}Position += ${listStringLengthBytes} + itemSize\n`;
                code += `                }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Int>':
                code += `                var ${fieldName}Count = (byteArray[${position}].toInt() and 0xFF)\n`;
                code += `                ${fieldName} = mutableListOf<Int>()\n`;
                code += `                var ${fieldName}Position = ${position} + 1\n`;
                code += `                for (i in 0 until ${fieldName}Count) {\n`;
                code += `                    var item = CmdHelper.byteToInt(byteArray.sliceArray(${fieldName}Position..${fieldName}Position + 3))\n`;
                code += `                    ${fieldName}?.add(item)\n`;
                code += `                    ${fieldName}Position += 4\n`;
                code += `                }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Int3>':
                code += `                var ${fieldName}Count = (byteArray[${position}].toInt() and 0xFF)\n`;
                code += `                ${fieldName} = mutableListOf<Int>()\n`;
                code += `                var ${fieldName}Position = ${position} + 1\n`;
                code += `                for (i in 0 until ${fieldName}Count) {\n`;
                code += `                    var item = CmdHelper.byte3ToInt(byteArray.sliceArray(${fieldName}Position..${fieldName}Position + 2))\n`;
                code += `                    ${fieldName}?.add(item)\n`;
                code += `                    ${fieldName}Position += 3\n`;
                code += `                }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Int2>':
                code += `                var ${fieldName}Count = (byteArray[${position}].toInt() and 0xFF)\n`;
                code += `                ${fieldName} = mutableListOf<Int>()\n`;
                code += `                var ${fieldName}Position = ${position} + 1\n`;
                code += `                for (i in 0 until ${fieldName}Count) {\n`;
                code += `                    var item = CmdHelper.byte2ToInt(byteArray.sliceArray(${fieldName}Position..${fieldName}Position + 1))\n`;
                code += `                    ${fieldName}?.add(item)\n`;
                code += `                    ${fieldName}Position += 2\n`;
                code += `                }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Int1>':
                code += `                var ${fieldName}Count = (byteArray[${position}].toInt() and 0xFF)\n`;
                code += `                ${fieldName} = mutableListOf<Int>()\n`;
                code += `                var ${fieldName}Position = ${position} + 1\n`;
                code += `                for (i in 0 until ${fieldName}Count) {\n`;
                code += `                    var item = CmdHelper.byte1ToInt(byteArray.sliceArray(${fieldName}Position..${fieldName}Position))\n`;
                code += `                    ${fieldName}?.add(item)\n`;
                code += `                    ${fieldName}Position += 1\n`;
                code += `                }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Byte>':
                code += `                var ${fieldName}Count = (byteArray[${position}].toInt() and 0xFF)\n`;
                code += `                ${fieldName} = mutableListOf<Byte>()\n`;
                code += `                var ${fieldName}Position = ${position} + 1\n`;
                code += `                for (i in 0 until ${fieldName}Count) {\n`;
                code += `                    ${fieldName}?.add(byteArray[${fieldName}Position])\n`;
                code += `                    ${fieldName}Position += 1\n`;
                code += `                }\n`;
                position = `${fieldName}Position`;
                break;
                
            default:
                code += `                // TODO: 处理 ${fieldType} 类型的 ${fieldName} 字段\n`;
                break;
        }
        
        if (index < fields.length - 1) {
            code += `\n`;
        }
    });
    
    return code;
}

// 生成 toByteArray 方法的具体实现
function generateToByteArrayCode(fields) {
    let code = `        return `;
    
    fields.forEach((field, index) => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        if (index > 0) {
            code += ` +\n                `;
        }
        
        switch (fieldType) {
            case 'String':
                const stringLengthBytes = field.stringLengthBytes || 1;
                if (stringLengthBytes === 1) {
                    code += `(${fieldName}?.let { byteArrayOf(it.toByteArray().size.toByte()) + it.toByteArray() } ?: byteArrayOf(0))`;
                } else if (stringLengthBytes === 2) {
                    code += `(${fieldName}?.let { CmdHelper.int2ToByte(it.toByteArray().size) + it.toByteArray() } ?: CmdHelper.int2ToByte(0))`;
                } else if (stringLengthBytes === 3) {
                    code += `(${fieldName}?.let { CmdHelper.int3ToByte(it.toByteArray().size) + it.toByteArray() } ?: CmdHelper.int3ToByte(0))`;
                } else if (stringLengthBytes === 4) {
                    code += `(${fieldName}?.let { CmdHelper.int4ToByte(it.toByteArray().size) + it.toByteArray() } ?: CmdHelper.int4ToByte(0))`;
                }
                break;
            case 'Int':
                code += `CmdHelper.intToByte(${fieldName} ?: 0)`;
                break;
            case 'Int3':
                code += `CmdHelper.intToByte3(${fieldName} ?: 0)`;
                break;
            case 'Int2':
                code += `CmdHelper.intToByte2(${fieldName} ?: 0)`;
                break;
            case 'Int1':
                code += `CmdHelper.intToByte1(${fieldName} ?: 0)`;
                break;
            case 'Long':
                code += `CmdHelper.longToByte(${fieldName} ?: 0L)`;
                break;
            case 'Short':
                code += `CmdHelper.shortToByte(${fieldName} ?: 0)`;
                break;
            case 'Byte':
                code += `byteArrayOf(${fieldName} ?: 0)`;
                break;
            case 'Boolean':
                code += `byteArrayOf(if (${fieldName} == true) 1 else 0)`;
                break;
            case 'Float':
                code += `CmdHelper.floatToByte(${fieldName} ?: 0f)`;
                break;
            case 'Double':
                code += `CmdHelper.doubleToByte(${fieldName} ?: 0.0)`;
                break;
            case 'ByteArray':
                code += `(${fieldName}?.let { byteArrayOf(it.size.toByte()) + it } ?: byteArrayOf(0))`;
                break;
            case 'MutableList<String>':
                const listStringLengthBytes = field.stringLengthBytes || 1;
                if (listStringLengthBytes === 1) {
                    code += `byteArrayOf((${fieldName}?.size ?: 0).toByte()) +\n                (${fieldName}?.fold(byteArrayOf()) { acc, item -> acc + byteArrayOf(item.toByteArray().size.toByte()) + item.toByteArray() } ?: byteArrayOf())`;
                } else if (listStringLengthBytes === 2) {
                    code += `byteArrayOf((${fieldName}?.size ?: 0).toByte()) +\n                (${fieldName}?.fold(byteArrayOf()) { acc, item -> acc + CmdHelper.int2ToByte(item.toByteArray().size) + item.toByteArray() } ?: byteArrayOf())`;
                } else if (listStringLengthBytes === 3) {
                    code += `byteArrayOf((${fieldName}?.size ?: 0).toByte()) +\n                (${fieldName}?.fold(byteArrayOf()) { acc, item -> acc + CmdHelper.int3ToByte(item.toByteArray().size) + item.toByteArray() } ?: byteArrayOf())`;
                } else if (listStringLengthBytes === 4) {
                    code += `byteArrayOf((${fieldName}?.size ?: 0).toByte()) +\n                (${fieldName}?.fold(byteArrayOf()) { acc, item -> acc + CmdHelper.int4ToByte(item.toByteArray().size) + item.toByteArray() } ?: byteArrayOf())`;
                }
                break;
            case 'MutableList<Int>':
                code += `byteArrayOf((${fieldName}?.size ?: 0).toByte()) +\n                (${fieldName}?.fold(byteArrayOf()) { acc, item -> acc + CmdHelper.intToByte(item) } ?: byteArrayOf())`;
                break;
            case 'MutableList<Int3>':
                code += `byteArrayOf((${fieldName}?.size ?: 0).toByte()) +\n                (${fieldName}?.fold(byteArrayOf()) { acc, item -> acc + CmdHelper.intToByte3(item) } ?: byteArrayOf())`;
                break;
            case 'MutableList<Int2>':
                code += `byteArrayOf((${fieldName}?.size ?: 0).toByte()) +\n                (${fieldName}?.fold(byteArrayOf()) { acc, item -> acc + CmdHelper.intToByte2(item) } ?: byteArrayOf())`;
                break;
            case 'MutableList<Int1>':
                code += `byteArrayOf((${fieldName}?.size ?: 0).toByte()) +\n                (${fieldName}?.fold(byteArrayOf()) { acc, item -> acc + CmdHelper.intToByte1(item) } ?: byteArrayOf())`;
                break;
            case 'MutableList<Byte>':
                code += `byteArrayOf((${fieldName}?.size ?: 0).toByte()) +\n                (${fieldName}?.toByteArray() ?: byteArrayOf())`;
                break;
            default:
                code += `// TODO: 处理 ${fieldType} 类型的 ${fieldName}`;
                break;
        }
    });
    
    return code;
} 