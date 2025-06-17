// Service和Dart代码生成器

// 生成Client Service代码
function generateClientServiceCode(generateBoth, reqClassName, rspClassName, baseName) {
    const serviceName = document.getElementById('serviceName').value.trim() || 'AiResService';
    const clientServiceName = serviceName.replace('Service', 'ClientService');
    const servicePackage = document.getElementById('servicePackage').value.trim() || 'com.tempolor.aimusic.proto';
    const includeInChunk = document.getElementById('includeInChunk').checked;
    const includeWithResponse = document.getElementById('includeWithResponse').checked;
    
    let code = `object ${clientServiceName} {`;
    
    // 生成方法
    if (generateBoth) {
        // 生成Req和Rsp对应的方法
        if (reqClassName && includeInChunk) {
            const methodName = toCamelCase(reqClassName.replace('Req', '')); // 去掉Req后缀并转为小写开头
            const paramName = toCamelCase(baseName) + 'Req';
            code += `\n    suspend fun ${methodName}ReqInChunk(${paramName}: ${reqClassName}): ${rspClassName} {\n`;
            code += `        val result = SendDataInChunksHelper.supReqInQueueEx(${paramName})\n`;
            code += `        return ${rspClassName}().apply {\n`;
            code += `            fromResponseWrap(result)\n`;
            code += `        }\n`;
            code += `    }\n`;
        }
        
        if (reqClassName && includeWithResponse) {
            const methodName = toCamelCase(reqClassName.replace('Req', '')); // 去掉Req后缀并转为小写开头
            const paramName = toCamelCase(baseName) + 'Req';
            code += `\n    suspend fun ${methodName}ReqWithResponse(${paramName}: ${reqClassName}): ${rspClassName} {\n`;
            code += `        val result = SendDataWithResponseHelper.supReqInQueueEx(${paramName})\n`;
            code += `        return ${rspClassName}().apply {\n`;
            code += `            fromResponseWrap(result)\n`;
            code += `        }\n`;
            code += `    }\n`;
        }
    } else {
        // 单个生成模式
        if (reqClassName) {
            const methodName = toCamelCase(reqClassName.replace('Req', '')); // 去掉Req后缀并转为小写开头
            const paramName = toCamelCase(baseName) + 'Req';
            
            if (includeInChunk) {
                code += `\n    suspend fun ${methodName}ReqInChunk(${paramName}: ${reqClassName}): ${rspClassName} {\n`;
                code += `        val result = SendDataInChunksHelper.supReqInQueueEx(${paramName})\n`;
                code += `        return ${rspClassName}().apply {\n`;
                code += `            fromResponseWrap(result)\n`;
                code += `        }\n`;
                code += `    }\n`;
            }
            
            if (includeWithResponse) {
                code += `\n    suspend fun ${methodName}ReqWithResponse(${paramName}: ${reqClassName}): ${rspClassName} {\n`;
                code += `        val result = SendDataWithResponseHelper.supReqInQueueEx(${paramName})\n`;
                code += `        return ${rspClassName}().apply {\n`;
                code += `            fromResponseWrap(result)\n`;
                code += `        }\n`;
                code += `    }\n`;
            }
        }
    }
    
    code += `\n}`;
    
    return code;
}

// 生成Server Service代码
function generateServerServiceCode(generateBoth, reqClassName, rspClassName, baseName) {
    const serviceName = document.getElementById('serviceName').value.trim() || 'AiResService';
    const serverServiceName = serviceName.replace('Service', 'ServerService');
    const includeServerSupReq = document.getElementById('includeServerSupReq').checked;
    const includeServerSendData = document.getElementById('includeServerSendData').checked;
    
    let code = `object ${serverServiceName} {`;
    
    // 生成方法
    if (generateBoth) {
        // 生成Req和Rsp对应的方法
        if (reqClassName && includeServerSupReq) {
            const methodName = toCamelCase(reqClassName.replace('Req', '')); // 去掉Req后缀并转为小写开头
            const paramName = toCamelCase(baseName) + 'Req';
            code += `\n    suspend fun ${methodName}SupReqInQueueEx(${paramName}: ${reqClassName}): ${rspClassName} {\n`;
            code += `        val result = BleSendDataHelper.instance.supReqInQueueEx(${paramName})\n`;
                code += `        return ${rspClassName}().apply {\n`;
                code += `            fromResponseWrap(result)\n`;
                code += `        }\n`;
                code += `    }\n`;
        }
        
        if (reqClassName && includeServerSendData) {
            const methodName = toCamelCase(reqClassName.replace('Req', '')); // 去掉Req后缀并转为小写开头
            const paramName = toCamelCase(baseName) + 'Req';
            code += `\n    suspend fun ${methodName}SendData(${paramName}: ${reqClassName}) {\n`;
            code += `        BleSendDataHelper.instance.sendData(${paramName})\n`;
            code += `    }\n`;
        }
    } else {
        // 单个生成模式
        if (reqClassName) {
            const methodName = toCamelCase(reqClassName.replace('Req', '')); // 去掉Req后缀并转为小写开头
            const paramName = toCamelCase(baseName) + 'Req';
            
            if (includeServerSupReq) {
                code += `\n    suspend fun ${methodName}SupReqInQueueEx(${paramName}: ${reqClassName}): Boolean {\n`;
                code += `        val result = BleSendDataHelper.instance.supReqInQueueEx(${paramName})\n`;
                code += `        return result?.errCode == ResponseResultCodeEnum.Success\n`;
                code += `    }\n`;
            }
            
            if (includeServerSendData) {
                code += `\n    suspend fun ${methodName}SendData(${paramName}: ${reqClassName}) {\n`;
                code += `        BleSendDataHelper.instance.sendData(${paramName})\n`;
                code += `    }\n`;
            }
        }
    }
    
    code += `\n}`;
    
    return code;
}

// 转换为驼峰命名法（首字母小写）
function toCamelCase(str) {
    if (!str) return 'defaultParam';
    
    // 如果已经是驼峰命名法，直接确保首字母小写
    if (/^[a-z][a-zA-Z0-9]*$/.test(str)) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }
    
    // 处理下划线、连字符等分隔符
    return str.toLowerCase()
        .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
        .replace(/^[A-Z]/, char => char.toLowerCase());
}

// 获取Service方法名称
function getServiceMethodName(baseName) {
    if (!baseName) return 'DefaultMethod';
    // 首字母大写
    return baseName.charAt(0).toUpperCase() + baseName.slice(1);
}

// 生成Dart类代码
function generateDartClassCode(className, fields = [], isReq = true, enumBaseName = '', enumType = 'AiResEnum') {
    let code = `import 'dart:typed_data';
import 'dart:convert';

class ${className} {
`;

    // 添加字段定义
    if (fields.length > 0) {
        fields.forEach(field => {
            const dartType = mapToDartType(field.type);
            code += `  // ${generateFieldComment(field.type, field)}\n`;
            code += `  ${dartType} ${field.name};\n\n`;
        });
    }

    // 添加构造函数
    code += `  ${className}({`;
    if (fields.length > 0) {
        fields.forEach((field, index) => {
            code += `this.${field.name}`;
            if (index < fields.length - 1) code += ', ';
        });
    }
    code += `});\n\n`;

    // 添加fromByteArray方法
    code += `  // 从字节数组反序列化
  void fromByteArray(Uint8List byteArray) {
    try {
      if (byteArray.isNotEmpty) {
`;

    if (fields.length > 0) {
        code += generateDartFromByteArrayCode(fields);
    }

    code += `      }
    } catch (e) {
      print('fromByteArray error: \$e');
    }
  }

  // 序列化为字节数组
  Uint8List toByteArray() {
    try {
`;

    if (fields.length > 0) {
        code += generateDartToByteArrayCode(fields);
    } else {
        code += `      return Uint8List(0);`;
    }

    code += `
    } catch (e) {
      print('toByteArray error: \$e');
      return Uint8List(0);
    }
  }

  // 从JSON反序列化
  void fromJson(Map<String, dynamic> json) {
    try {
`;

    if (fields.length > 0) {
        code += generateDartFromJsonCode(fields);
    }

    code += `    } catch (e) {
      print('fromJson error: \$e');
    }
  }

  // 序列化为JSON
  Map<String, dynamic> toJson() {
    try {
      Map<String, dynamic> json = {};
`;

    if (fields.length > 0) {
        code += generateDartToJsonCode(fields);
    }

    code += `      return json;
    } catch (e) {
      print('toJson error: \$e');
      return {};
    }
  }

  @override
  String toString() {
    return 'json: \${jsonEncode(toJson())}';
  }
}`;

    return code;
}

// 生成Dart fromByteArray方法的具体实现
function generateDartFromByteArrayCode(fields) {
    let code = '';
    let position = 0;
    
    fields.forEach((field, index) => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        switch (fieldType) {
            case 'String':
                const stringLengthBytes = field.stringLengthBytes || 1;
                if (stringLengthBytes === 1) {
                    code += `        int ${fieldName}Size = byteArray[${position}];\n`;
                } else if (stringLengthBytes === 2) {
                    code += `        int ${fieldName}Size = ByteData.sublistView(byteArray, ${position}, 2).getInt16(0, Endian.little);\n`;
                } else if (stringLengthBytes === 3) {
                    code += `        int ${fieldName}Size = byteArray[${position}] | (byteArray[${typeof position === 'string' ? `${position} + 1` : position + 1}] << 8) | (byteArray[${typeof position === 'string' ? `${position} + 2` : position + 2}] << 16);\n`;
                } else if (stringLengthBytes === 4) {
                    code += `        int ${fieldName}Size = ByteData.sublistView(byteArray, ${position}, 4).getInt32(0, Endian.little);\n`;
                }
                code += `        if (${fieldName}Size > 0) {\n`;
                code += `          Uint8List ${fieldName}Bytes = byteArray.sublist(${typeof position === 'string' ? `${position} + ${stringLengthBytes}` : `${position + stringLengthBytes}`}, ${typeof position === 'string' ? `${position} + ${stringLengthBytes}` : `${position + stringLengthBytes}`} + ${fieldName}Size);\n`;
                code += `          ${fieldName} = utf8.decode(${fieldName}Bytes);\n`;
                code += `        }\n`;
                position = `${typeof position === 'string' ? position : position} + ${stringLengthBytes} + ${fieldName}Size`;
                break;
                
            case 'Int':
                code += `        ${fieldName} = ByteData.sublistView(byteArray, ${position}, 4).getInt32(0, Endian.little);\n`;
                position = typeof position === 'string' ? `${position} + 4` : position + 4;
                break;
                
            case 'Int3':
                code += `        // 3字节整数处理\n`;
                code += `        ${fieldName} = byteArray[${position}] | (byteArray[${typeof position === 'string' ? `${position} + 1` : position + 1}] << 8) | (byteArray[${typeof position === 'string' ? `${position} + 2` : position + 2}] << 16);\n`;
                position = typeof position === 'string' ? `${position} + 3` : position + 3;
                break;
                
            case 'Int2':
                code += `        ${fieldName} = ByteData.sublistView(byteArray, ${position}, 2).getInt16(0, Endian.little);\n`;
                position = typeof position === 'string' ? `${position} + 2` : position + 2;
                break;
                
            case 'Int1':
                code += `        ${fieldName} = byteArray[${position}];\n`;
                position = typeof position === 'string' ? `${position} + 1` : position + 1;
                break;
                
            case 'Long':
                code += `        ${fieldName} = ByteData.sublistView(byteArray, ${position}, 8).getInt64(0, Endian.little);\n`;
                position = typeof position === 'string' ? `${position} + 8` : position + 8;
                break;
                
            case 'Boolean':
                code += `        ${fieldName} = byteArray[${position}] != 0;\n`;
                position = typeof position === 'string' ? `${position} + 1` : position + 1;
                break;
                
            case 'Float':
                code += `        ${fieldName} = ByteData.sublistView(byteArray, ${position}, 4).getFloat32(0, Endian.little);\n`;
                position = typeof position === 'string' ? `${position} + 4` : position + 4;
                break;
                
            case 'Double':
                code += `        ${fieldName} = ByteData.sublistView(byteArray, ${position}, 8).getFloat64(0, Endian.little);\n`;
                position = typeof position === 'string' ? `${position} + 8` : position + 8;
                break;
                
            case 'ByteArray':
                code += `        int ${fieldName}Size = byteArray[${position}];\n`;
                code += `        if (${fieldName}Size > 0) {\n`;
                code += `          ${fieldName} = byteArray.sublist(${position + 1}, ${position + 1} + ${fieldName}Size);\n`;
                code += `        }\n`;
                position = `${position} + 1 + ${fieldName}Size`;
                break;
                
            default:
                code += `        // TODO: 处理 ${fieldType} 类型的 ${fieldName} 字段\n`;
                break;
        }
        
        if (index < fields.length - 1) {
            code += `\n`;
        }
    });
    
    return code;
}

// 生成Dart toByteArray方法的具体实现
function generateDartToByteArrayCode(fields) {
    let code = `      List<int> bytes = [];\n\n`;
    
    fields.forEach(field => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        switch (fieldType) {
            case 'String':
                const stringLengthBytes = field.stringLengthBytes || 1;
                code += `      if (${fieldName} != null) {\n`;
                code += `        Uint8List ${fieldName}Bytes = utf8.encode(${fieldName}!);\n`;
                if (stringLengthBytes === 1) {
                    code += `        bytes.add(${fieldName}Bytes.length);\n`;
                } else if (stringLengthBytes === 2) {
                    code += `        ByteData lengthData = ByteData(2);\n`;
                    code += `        lengthData.setInt16(0, ${fieldName}Bytes.length, Endian.little);\n`;
                    code += `        bytes.addAll(lengthData.buffer.asUint8List());\n`;
                } else if (stringLengthBytes === 3) {
                    code += `        int length = ${fieldName}Bytes.length;\n`;
                    code += `        bytes.add(length & 0xFF);\n`;
                    code += `        bytes.add((length >> 8) & 0xFF);\n`;
                    code += `        bytes.add((length >> 16) & 0xFF);\n`;
                } else if (stringLengthBytes === 4) {
                    code += `        ByteData lengthData = ByteData(4);\n`;
                    code += `        lengthData.setInt32(0, ${fieldName}Bytes.length, Endian.little);\n`;
                    code += `        bytes.addAll(lengthData.buffer.asUint8List());\n`;
                }
                code += `        bytes.addAll(${fieldName}Bytes);\n`;
                code += `      } else {\n`;
                if (stringLengthBytes === 1) {
                    code += `        bytes.add(0);\n`;
                } else if (stringLengthBytes === 2) {
                    code += `        bytes.addAll([0, 0]);\n`;
                } else if (stringLengthBytes === 3) {
                    code += `        bytes.addAll([0, 0, 0]);\n`;
                } else if (stringLengthBytes === 4) {
                    code += `        bytes.addAll([0, 0, 0, 0]);\n`;
                }
                code += `      }\n\n`;
                break;
            case 'Int':
                code += `      ByteData intData = ByteData(4);\n`;
                code += `      intData.setInt32(0, ${fieldName} ?? 0, Endian.little);\n`;
                code += `      bytes.addAll(intData.buffer.asUint8List());\n\n`;
                break;
            case 'Int3':
                code += `      int value = ${fieldName} ?? 0;\n`;
                code += `      bytes.add(value & 0xFF);\n`;
                code += `      bytes.add((value >> 8) & 0xFF);\n`;
                code += `      bytes.add((value >> 16) & 0xFF);\n\n`;
                break;
            case 'Boolean':
                code += `      bytes.add((${fieldName} ?? false) ? 1 : 0);\n\n`;
                break;
            case 'ByteArray':
                code += `      if (${fieldName} != null) {\n`;
                code += `        bytes.add(${fieldName}!.length);\n`;
                code += `        bytes.addAll(${fieldName}!);\n`;
                code += `      } else {\n`;
                code += `        bytes.add(0);\n`;
                code += `      }\n\n`;
                break;
            default:
                code += `      // TODO: 处理 ${fieldType} 类型的 ${fieldName}\n\n`;
                break;
        }
    });
    
    code += `      return Uint8List.fromList(bytes);`;
    return code;
}

// 生成Dart fromJson方法的具体实现
function generateDartFromJsonCode(fields) {
    let code = '';
    
    fields.forEach((field, index) => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        switch (fieldType) {
            case 'String':
                code += `      ${fieldName} = json['${fieldName}'] as String?;\n`;
                break;
            case 'Int':
            case 'Int3':
            case 'Int2':
            case 'Int1':
            case 'Long':
            case 'Short':
            case 'Byte':
                code += `      ${fieldName} = json['${fieldName}'] as int?;\n`;
                break;
            case 'Boolean':
                code += `      ${fieldName} = json['${fieldName}'] as bool?;\n`;
                break;
            case 'Float':
            case 'Double':
                code += `      ${fieldName} = json['${fieldName}'] as double?;\n`;
                break;
            case 'ByteArray':
                code += `      String? ${fieldName}Base64 = json['${fieldName}'] as String?;\n`;
                code += `      if (${fieldName}Base64 != null) {\n`;
                code += `        ${fieldName} = base64Decode(${fieldName}Base64);\n`;
                code += `      }\n`;
                break;
            default:
                code += `      // TODO: 处理 ${fieldType} 类型的 ${fieldName} 字段\n`;
                break;
        }
        
        if (index < fields.length - 1) {
            code += `\n`;
        }
    });
    
    return code;
}

// 生成Dart toJson方法的具体实现
function generateDartToJsonCode(fields) {
    let code = '';
    
    fields.forEach((field, index) => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        switch (fieldType) {
            case 'String':
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
                code += `      if (${fieldName} != null) json['${fieldName}'] = ${fieldName};\n`;
                break;
            case 'ByteArray':
                code += `      if (${fieldName} != null) {\n`;
                code += `        json['${fieldName}'] = base64Encode(${fieldName}!);\n`;
                code += `      }\n`;
                break;
            default:
                code += `      // TODO: 处理 ${fieldType} 类型的 ${fieldName} 字段\n`;
                break;
        }
        
        if (index < fields.length - 1) {
            code += `\n`;
        }
    });
    
    return code;
} 