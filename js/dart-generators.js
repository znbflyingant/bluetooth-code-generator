// Dart代码生成器

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
        'MutableList<Byte>': 'List<int>?',
        'MutableList<ByteArray>': 'List<Uint8List>?'
    };
    return typeMap[kotlinType] || 'dynamic';
}

// 生成字段注释
function generateFieldComment(fieldType, field) {
    let comment = '';
    switch (fieldType) {
        case 'String':
            const stringLengthBytes = field.stringLengthBytes || 1;
            comment = `字符串字段 (${stringLengthBytes}字节长度前缀)`;
            break;
        case 'Int':
            comment = '32位整数字段';
            break;
        case 'Int3':
            comment = '24位整数字段';
            break;
        case 'Int2':
            comment = '16位整数字段';
            break;
        case 'Int1':
            comment = '8位整数字段';
            break;
        case 'Long':
            comment = '64位长整数字段';
            break;
        case 'Short':
            comment = '16位短整数字段';
            break;
        case 'Byte':
            comment = '8位字节字段';
            break;
        case 'Boolean':
            comment = '布尔字段';
            break;
        case 'Float':
            comment = '32位浮点数字段';
            break;
        case 'Double':
            comment = '64位双精度浮点数字段';
            break;
        case 'ByteArray':
            comment = '字节数组字段';
            break;
        default:
            comment = `${fieldType} 字段`;
            break;
    }
    return comment;
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
    code += `  ${className}({\n`;
    if (fields.length > 0) {
        fields.forEach(field => {
            code += `    this.${field.name},\n`;
        });
    }
    code += `  });\n\n`;

    // 生成fromByteArrayByteType方法
    code += `  // 从字节数组反序列化 (字节格式，兼容Kotlin CmdHelper)
  void fromByteArrayByteType(Uint8List byteArray) {
    try {
      if (byteArray.isNotEmpty) {
`;

    if (fields.length > 0) {
        code += generateDartFromByteArrayCode(fields);
    }

    code += `      }
    } catch (e) {
      print('fromByteArrayByteType error: \$e');
    }
  }

  // 序列化为字节数组 (字节格式，兼容Kotlin CmdHelper)
  Uint8List toByteArrayByteType() {
    try {
`;

    if (fields.length > 0) {
        code += generateDartToByteArrayCode(fields);
    } else {
        code += `      return Uint8List(0);`;
    }

    code += `
    } catch (e) {
      print('toByteArrayByteType error: \$e');
      return Uint8List(0);
    }
  }

  // 从字节数组反序列化 (调用字节格式方法)
  void fromByteArray(Uint8List byteArray) {
    fromByteArrayByteType(byteArray);
  }

  // 序列化为字节数组 (调用字节格式方法)
  Uint8List toByteArray() {
    return toByteArrayByteType();
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

  // 从JSON字节数组反序列化 (兼容Kotlin fromByteArrayJsonType)
  void fromByteArrayJsonType(Uint8List byteArray) {
    try {
      String jsonString = utf8.decode(byteArray);
      Map<String, dynamic> jsonObject = jsonDecode(jsonString);
      fromJson(jsonObject);
    } catch (e) {
      print('fromByteArrayJsonType error: \$e');
    }
  }

  // 序列化为JSON字节数组 (兼容Kotlin toByteArrayJsonType)
  Uint8List toByteArrayJsonType() {
    try {
      Map<String, dynamic> jsonObject = toJson();
      String jsonString = jsonEncode(jsonObject);
      return Uint8List.fromList(utf8.encode(jsonString));
    } catch (e) {
      print('toByteArrayJsonType error: \$e');
      return Uint8List(0);
    }
  }

  @override
  String toString() {
    return 'json: \${jsonEncode(toJson())}';
  }
}`;

    return code;
}

// 生成Dart fromByteArray方法的具体实现 (兼容Kotlin CmdHelper)
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
                    code += `        int ${fieldName}Size = ByteHelper.byte1ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 1` : position + 1}));\n`;
                } else if (stringLengthBytes === 2) {
                    code += `        int ${fieldName}Size = ByteHelper.byte2ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 2` : position + 2}));\n`;
                } else if (stringLengthBytes === 3) {
                    code += `        int ${fieldName}Size = ByteHelper.byte3ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 3` : position + 3}));\n`;
                } else if (stringLengthBytes === 4) {
                    code += `        int ${fieldName}Size = ByteHelper.byteToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 4` : position + 4}));\n`;
                }
                code += `        if (${fieldName}Size > 0) {\n`;
                code += `          Uint8List ${fieldName}Bytes = byteArray.sublist(${typeof position === 'string' ? `${position} + ${stringLengthBytes}` : `${position + stringLengthBytes}`}, ${typeof position === 'string' ? `${position} + ${stringLengthBytes}` : `${position + stringLengthBytes}`} + ${fieldName}Size);\n`;
                code += `          ${fieldName} = utf8.decode(${fieldName}Bytes);\n`;
                code += `        }\n`;
                position = `${typeof position === 'string' ? position : position} + ${stringLengthBytes} + ${fieldName}Size`;
                break;
                
            case 'Int':
                code += `        ${fieldName} = ByteHelper.byteToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 4` : position + 4}));\n`;
                position = typeof position === 'string' ? `${position} + 4` : position + 4;
                break;
                
            case 'Int3':
                code += `        ${fieldName} = ByteHelper.byte3ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 3` : position + 3}));\n`;
                position = typeof position === 'string' ? `${position} + 3` : position + 3;
                break;
                
            case 'Int2':
                code += `        ${fieldName} = ByteHelper.byte2ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 2` : position + 2}));\n`;
                position = typeof position === 'string' ? `${position} + 2` : position + 2;
                break;
                
            case 'Int1':
                code += `        ${fieldName} = ByteHelper.byte1ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 1` : position + 1}));\n`;
                position = typeof position === 'string' ? `${position} + 1` : position + 1;
                break;
                
            case 'Long':
                code += `        ${fieldName} = ByteHelper.byteToLong(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 8` : position + 8}));\n`;
                position = typeof position === 'string' ? `${position} + 8` : position + 8;
                break;
                
            case 'Short':
                code += `        ${fieldName} = ByteHelper.byteToShort(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 2` : position + 2}));\n`;
                position = typeof position === 'string' ? `${position} + 2` : position + 2;
                break;
                
            case 'Byte':
                code += `        ${fieldName} = byteArray[${position}];\n`;
                position = typeof position === 'string' ? `${position} + 1` : position + 1;
                break;
                
            case 'Boolean':
                code += `        ${fieldName} = byteArray[${position}] != 0;\n`;
                position = typeof position === 'string' ? `${position} + 1` : position + 1;
                break;
                
            case 'Float':
                code += `        ${fieldName} = ByteHelper.byteToFloat(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 4` : position + 4}));\n`;
                position = typeof position === 'string' ? `${position} + 4` : position + 4;
                break;
                
            case 'Double':
                code += `        ${fieldName} = ByteHelper.byteToDouble(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 8` : position + 8}));\n`;
                position = typeof position === 'string' ? `${position} + 8` : position + 8;
                break;
                
            case 'ByteArray':
                code += `        int ${fieldName}Size = ByteHelper.byte1ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 1` : position + 1}));\n`;
                code += `        if (${fieldName}Size > 0) {\n`;
                code += `          ${fieldName} = byteArray.sublist(${typeof position === 'string' ? `${position} + 1` : position + 1}, ${typeof position === 'string' ? `${position} + 1` : position + 1} + ${fieldName}Size);\n`;
                code += `        }\n`;
                position = `${position} + 1 + ${fieldName}Size`;
                break;

            case 'MutableList<String>':
                const stringListLengthBytes = field.stringLengthBytes || 1;
                code += `        int ${fieldName}Count = ByteHelper.byte1ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 1` : position + 1}));\n`;
                code += `        ${fieldName} = <String>[];\n`;
                code += `        int ${fieldName}Position = ${typeof position === 'string' ? `${position} + 1` : position + 1};\n`;
                code += `        for (int i = 0; i < ${fieldName}Count; i++) {\n`;
                if (stringListLengthBytes === 1) {
                    code += `          int strLen = ByteHelper.byte1ToInt(byteArray.sublist(${fieldName}Position, ${fieldName}Position + 1));\n`;
                } else if (stringListLengthBytes === 2) {
                    code += `          int strLen = ByteHelper.byte2ToInt(byteArray.sublist(${fieldName}Position, ${fieldName}Position + 2));\n`;
                } else if (stringListLengthBytes === 3) {
                    code += `          int strLen = ByteHelper.byte3ToInt(byteArray.sublist(${fieldName}Position, ${fieldName}Position + 3));\n`;
                } else if (stringListLengthBytes === 4) {
                    code += `          int strLen = ByteHelper.byteToInt(byteArray.sublist(${fieldName}Position, ${fieldName}Position + 4));\n`;
                }
                code += `          ${fieldName}Position += ${stringListLengthBytes};\n`;
                code += `          if (strLen > 0) {\n`;
                code += `            String str = utf8.decode(byteArray.sublist(${fieldName}Position, ${fieldName}Position + strLen));\n`;
                code += `            ${fieldName}!.add(str);\n`;
                code += `            ${fieldName}Position += strLen;\n`;
                code += `          }\n`;
                code += `        }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Int>':
                code += `        int ${fieldName}Count = ByteHelper.byte1ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 1` : position + 1}));\n`;
                code += `        ${fieldName} = <int>[];\n`;
                code += `        int ${fieldName}Position = ${typeof position === 'string' ? `${position} + 1` : position + 1};\n`;
                code += `        for (int i = 0; i < ${fieldName}Count; i++) {\n`;
                code += `          int value = ByteHelper.byteToInt(byteArray.sublist(${fieldName}Position, ${fieldName}Position + 4));\n`;
                code += `          ${fieldName}!.add(value);\n`;
                code += `          ${fieldName}Position += 4;\n`;
                code += `        }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Int3>':
                code += `        int ${fieldName}Count = ByteHelper.byte1ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 1` : position + 1}));\n`;
                code += `        ${fieldName} = <int>[];\n`;
                code += `        int ${fieldName}Position = ${typeof position === 'string' ? `${position} + 1` : position + 1};\n`;
                code += `        for (int i = 0; i < ${fieldName}Count; i++) {\n`;
                code += `          int value = ByteHelper.byte3ToInt(byteArray.sublist(${fieldName}Position, ${fieldName}Position + 3));\n`;
                code += `          ${fieldName}!.add(value);\n`;
                code += `          ${fieldName}Position += 3;\n`;
                code += `        }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Int2>':
                code += `        int ${fieldName}Count = ByteHelper.byte1ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 1` : position + 1}));\n`;
                code += `        ${fieldName} = <int>[];\n`;
                code += `        int ${fieldName}Position = ${typeof position === 'string' ? `${position} + 1` : position + 1};\n`;
                code += `        for (int i = 0; i < ${fieldName}Count; i++) {\n`;
                code += `          int value = ByteHelper.byte2ToInt(byteArray.sublist(${fieldName}Position, ${fieldName}Position + 2));\n`;
                code += `          ${fieldName}!.add(value);\n`;
                code += `          ${fieldName}Position += 2;\n`;
                code += `        }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Int1>':
                code += `        int ${fieldName}Count = ByteHelper.byte1ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 1` : position + 1}));\n`;
                code += `        ${fieldName} = <int>[];\n`;
                code += `        int ${fieldName}Position = ${typeof position === 'string' ? `${position} + 1` : position + 1};\n`;
                code += `        for (int i = 0; i < ${fieldName}Count; i++) {\n`;
                code += `          int value = ByteHelper.byte1ToInt(byteArray.sublist(${fieldName}Position, ${fieldName}Position + 1));\n`;
                code += `          ${fieldName}!.add(value);\n`;
                code += `          ${fieldName}Position += 1;\n`;
                code += `        }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Byte>':
                code += `        int ${fieldName}Count = ByteHelper.byte1ToInt(byteArray.sublist(${position}, ${typeof position === 'string' ? `${position} + 1` : position + 1}));\n`;
                code += `        ${fieldName} = <int>[];\n`;
                code += `        int ${fieldName}Position = ${typeof position === 'string' ? `${position} + 1` : position + 1};\n`;
                code += `        for (int i = 0; i < ${fieldName}Count; i++) {\n`;
                code += `          ${fieldName}!.add(byteArray[${fieldName}Position]);\n`;
                code += `          ${fieldName}Position += 1;\n`;
                code += `        }\n`;
                position = `${fieldName}Position`;
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

// 生成Dart toByteArray方法的具体实现 (兼容Kotlin CmdHelper)
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
                    code += `        bytes.addAll(ByteHelper.intToByte1(${fieldName}Bytes.length));\n`;
                } else if (stringLengthBytes === 2) {
                    code += `        bytes.addAll(ByteHelper.intToByte2(${fieldName}Bytes.length));\n`;
                } else if (stringLengthBytes === 3) {
                    code += `        bytes.addAll(ByteHelper.intToByte3(${fieldName}Bytes.length));\n`;
                } else if (stringLengthBytes === 4) {
                    code += `        bytes.addAll(ByteHelper.intToByte(${fieldName}Bytes.length));\n`;
                }
                code += `        bytes.addAll(${fieldName}Bytes);\n`;
                code += `      } else {\n`;
                if (stringLengthBytes === 1) {
                    code += `        bytes.addAll(ByteHelper.intToByte1(0));\n`;
                } else if (stringLengthBytes === 2) {
                    code += `        bytes.addAll(ByteHelper.intToByte2(0));\n`;
                } else if (stringLengthBytes === 3) {
                    code += `        bytes.addAll(ByteHelper.intToByte3(0));\n`;
                } else if (stringLengthBytes === 4) {
                    code += `        bytes.addAll(ByteHelper.intToByte(0));\n`;
                }
                code += `      }\n\n`;
                break;
            case 'Int':
                code += `      bytes.addAll(ByteHelper.intToByte(${fieldName} ?? 0));\n\n`;
                break;
            case 'Int3':
                code += `      bytes.addAll(ByteHelper.intToByte3(${fieldName} ?? 0));\n\n`;
                break;
            case 'Int2':
                code += `      bytes.addAll(ByteHelper.intToByte2(${fieldName} ?? 0));\n\n`;
                break;
            case 'Int1':
                code += `      bytes.addAll(ByteHelper.intToByte1(${fieldName} ?? 0));\n\n`;
                break;
            case 'Long':
                code += `      bytes.addAll(ByteHelper.longToByte(${fieldName} ?? 0));\n\n`;
                break;
            case 'Short':
                code += `      bytes.addAll(ByteHelper.shortToByte(${fieldName} ?? 0));\n\n`;
                break;
            case 'Byte':
                code += `      bytes.add(${fieldName} ?? 0);\n\n`;
                break;
            case 'Boolean':
                code += `      bytes.add((${fieldName} ?? false) ? 1 : 0);\n\n`;
                break;
            case 'Float':
                code += `      bytes.addAll(ByteHelper.floatToByte(${fieldName} ?? 0.0));\n\n`;
                break;
            case 'Double':
                code += `      bytes.addAll(ByteHelper.doubleToByte(${fieldName} ?? 0.0));\n\n`;
                break;
            case 'ByteArray':
                code += `      if (${fieldName} != null) {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(${fieldName}!.length));\n`;
                code += `        bytes.addAll(${fieldName}!);\n`;
                code += `      } else {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(0));\n`;
                code += `      }\n\n`;
                break;
            case 'MutableList<String>':
                const toStringLengthBytes = field.stringLengthBytes || 1;
                code += `      if (${fieldName} != null) {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(${fieldName}!.length));\n`;
                code += `        for (String str in ${fieldName}!) {\n`;
                code += `          Uint8List strBytes = utf8.encode(str);\n`;
                if (toStringLengthBytes === 1) {
                    code += `          bytes.addAll(ByteHelper.intToByte1(strBytes.length));\n`;
                } else if (toStringLengthBytes === 2) {
                    code += `          bytes.addAll(ByteHelper.intToByte2(strBytes.length));\n`;
                } else if (toStringLengthBytes === 3) {
                    code += `          bytes.addAll(ByteHelper.intToByte3(strBytes.length));\n`;
                } else if (toStringLengthBytes === 4) {
                    code += `          bytes.addAll(ByteHelper.intToByte(strBytes.length));\n`;
                }
                code += `          bytes.addAll(strBytes);\n`;
                code += `        }\n`;
                code += `      } else {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(0));\n`;
                code += `      }\n\n`;
                break;
            case 'MutableList<Int>':
                code += `      if (${fieldName} != null) {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(${fieldName}!.length));\n`;
                code += `        for (int value in ${fieldName}!) {\n`;
                code += `          bytes.addAll(ByteHelper.intToByte(value));\n`;
                code += `        }\n`;
                code += `      } else {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(0));\n`;
                code += `      }\n\n`;
                break;
            case 'MutableList<Int3>':
                code += `      if (${fieldName} != null) {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(${fieldName}!.length));\n`;
                code += `        for (int value in ${fieldName}!) {\n`;
                code += `          bytes.addAll(ByteHelper.intToByte3(value));\n`;
                code += `        }\n`;
                code += `      } else {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(0));\n`;
                code += `      }\n\n`;
                break;
            case 'MutableList<Int2>':
                code += `      if (${fieldName} != null) {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(${fieldName}!.length));\n`;
                code += `        for (int value in ${fieldName}!) {\n`;
                code += `          bytes.addAll(ByteHelper.intToByte2(value));\n`;
                code += `        }\n`;
                code += `      } else {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(0));\n`;
                code += `      }\n\n`;
                break;
            case 'MutableList<Int1>':
                code += `      if (${fieldName} != null) {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(${fieldName}!.length));\n`;
                code += `        for (int value in ${fieldName}!) {\n`;
                code += `          bytes.addAll(ByteHelper.intToByte1(value));\n`;
                code += `        }\n`;
                code += `      } else {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(0));\n`;
                code += `      }\n\n`;
                break;
            case 'MutableList<Byte>':
                code += `      if (${fieldName} != null) {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(${fieldName}!.length));\n`;
                code += `        for (int value in ${fieldName}!) {\n`;
                code += `          bytes.add(value);\n`;
                code += `        }\n`;
                code += `      } else {\n`;
                code += `        bytes.addAll(ByteHelper.intToByte1(0));\n`;
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
            case 'MutableList<String>':
                code += `      List<dynamic>? ${fieldName}List = json['${fieldName}'] as List<dynamic>?;\n`;
                code += `      if (${fieldName}List != null) {\n`;
                code += `        ${fieldName} = ${fieldName}List.cast<String>();\n`;
                code += `      }\n`;
                break;
            case 'MutableList<Int>':
            case 'MutableList<Int3>':
            case 'MutableList<Int2>':
            case 'MutableList<Int1>':
            case 'MutableList<Byte>':
                code += `      List<dynamic>? ${fieldName}List = json['${fieldName}'] as List<dynamic>?;\n`;
                code += `      if (${fieldName}List != null) {\n`;
                code += `        ${fieldName} = ${fieldName}List.cast<int>();\n`;
                code += `      }\n`;
                break;
            case 'MutableList<ByteArray>':
                code += `      List<dynamic>? ${fieldName}List = json['${fieldName}'] as List<dynamic>?;\n`;
                code += `      if (${fieldName}List != null) {\n`;
                code += `        ${fieldName} = ${fieldName}List.map((base64String) => base64Decode(base64String as String)).toList();\n`;
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
    
    fields.forEach(field => {
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
            case 'MutableList<String>':
            case 'MutableList<Int>':
            case 'MutableList<Int3>':
            case 'MutableList<Int2>':
            case 'MutableList<Int1>':
            case 'MutableList<Byte>':
                code += `      if (${fieldName} != null) json['${fieldName}'] = ${fieldName};\n`;
                break;
            case 'MutableList<ByteArray>':
                code += `      if (${fieldName} != null) {\n`;
                code += `        json['${fieldName}'] = ${fieldName}!.map((byteArray) => base64Encode(byteArray)).toList();\n`;
                code += `      }\n`;
                break;
            default:
                code += `      // TODO: 处理 ${fieldType} 类型的 ${fieldName} 字段\n`;
                break;
        }
    });
    
    return code;
} 

// 测试Dart和Kotlin字节转换兼容性的函数
function generateByteCompatibilityTestCode() {
    return `void testByteCompatibility() {
  print('=== 测试Dart与Kotlin字节转换兼容性 ===');
  int testInt = 0x12345678;
  var intBytes = ByteHelper.intToByte(testInt);
  var decodedInt = ByteHelper.byteToInt(intBytes);
  print('Int兼容性: \${testInt == decodedInt}');
  print('=== 测试完成 ===');
}`;
}