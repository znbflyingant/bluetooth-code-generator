#!/bin/bash

# Netlify 命令行部署脚本
# 蓝牙指令代码生成器

echo "🚀 开始 Netlify 命令行部署..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 错误处理函数
cleanup_on_error() {
    echo -e "${RED}❌ 部署过程中出现错误${NC}"
    if [ -d "deploy_package" ]; then
        echo -e "${YELLOW}保留临时文件以便调试: ./deploy_package/${NC}"
    fi
    exit 1
}

# 设置错误时自动调用清理函数
trap cleanup_on_error ERR

# 检查 Netlify CLI 是否安装
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}📦 正在安装 Netlify CLI...${NC}"
    npm install -g netlify-cli
fi

# 检查登录状态
echo -e "${BLUE}🔐 检查登录状态...${NC}"
if ! netlify status &> /dev/null; then
    echo -e "${YELLOW}需要登录 Netlify，浏览器将自动打开...${NC}"
    netlify login
fi

# 创建部署包
echo -e "${BLUE}📦 准备部署文件...${NC}"

# 清理现有部署包（如果存在）
if [ -d "deploy_package" ]; then
    echo -e "${YELLOW}清理现有部署包...${NC}"
    rm -rf deploy_package
fi

# 创建新的部署包
mkdir -p deploy_package/js

# 生成版本时间戳
VERSION_TIMESTAMP=$(date +"%Y%m%d%H%M%S")
echo -e "${BLUE}📅 版本时间戳: ${VERSION_TIMESTAMP}${NC}"

# 复制必要文件
echo -e "${BLUE}📋 复制项目文件...${NC}"

# 检查并复制CSS文件，添加版本号
if [ -f "styles.css" ]; then
    VERSIONED_CSS="styles.${VERSION_TIMESTAMP}.css"
    cp styles.css "deploy_package/${VERSIONED_CSS}"
    echo -e "${GREEN}✓ styles.css → ${VERSIONED_CSS}${NC}"
else
    echo -e "${RED}❌ 找不到 styles.css${NC}"
    exit 1
fi

# 复制JavaScript文件，添加版本号
if [ -d "js" ]; then
    mkdir -p deploy_package/js
    JS_FILES_COUNT=0
    VERSIONED_JS_FILES=""
    
    for js_file in js/*.js; do
        if [ -f "$js_file" ]; then
            filename=$(basename "$js_file" .js)
            versioned_name="${filename}.${VERSION_TIMESTAMP}.js"
            cp "$js_file" "deploy_package/js/${versioned_name}"
            VERSIONED_JS_FILES="${VERSIONED_JS_FILES}${filename}:${versioned_name}\n"
            ((JS_FILES_COUNT++))
        fi
    done
    
    echo -e "${GREEN}✓ 复制了 $JS_FILES_COUNT 个 JavaScript 文件并添加版本号${NC}"
else
    echo -e "${RED}❌ 找不到 js 目录${NC}"
    exit 1
fi

# 处理HTML文件，更新资源引用和版本信息
if [ -f "code_generator.html" ]; then
    echo -e "${BLUE}🔄 更新HTML文件中的资源引用和版本信息...${NC}"
    
    # 复制HTML文件到临时位置
    cp code_generator.html deploy_package/code_generator.html
    
    # 更新版本信息
    BUILD_TIME=$(date +"%Y-%m-%d %H:%M:%S")
    GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')
    
    echo -e "${BLUE}📅 构建信息:${NC}"
    echo -e "${BLUE}   时间戳: ${VERSION_TIMESTAMP}${NC}"
    echo -e "${BLUE}   构建时间: ${BUILD_TIME}${NC}"
    echo -e "${BLUE}   Git提交: ${GIT_COMMIT}${NC}"
    
    # 替换版本占位符
    sed -i.bak "s/BUILD_VERSION_PLACEHOLDER/${VERSION_TIMESTAMP}/g" deploy_package/code_generator.html
    sed -i.bak "s/BUILD_TIME_PLACEHOLDER/${BUILD_TIME}/g" deploy_package/code_generator.html
    
    # 更新CSS引用
    sed -i.bak "s/href=\"styles\.css\"/href=\"styles.${VERSION_TIMESTAMP}.css\"/g" deploy_package/code_generator.html
    
    # 更新所有JS文件引用
    echo -e "${VERSIONED_JS_FILES}" | while IFS=':' read -r original versioned; do
        if [ -n "$original" ] && [ -n "$versioned" ]; then
            sed -i.bak "s/src=\"js\/${original}\.js\"/src=\"js\/${versioned}\"/g" deploy_package/code_generator.html
        fi
    done
    
    # 删除备份文件
    rm -f deploy_package/code_generator.html.bak*
    
    echo -e "${GREEN}✓ HTML文件资源引用和版本信息更新完成${NC}"
else
    echo -e "${RED}❌ 找不到 code_generator.html${NC}"
    exit 1
fi

# 复制配置文件
if [ -f "netlify.toml" ]; then
    cp netlify.toml deploy_package/
    echo -e "${GREEN}✓ netlify.toml${NC}"
else
    echo -e "${YELLOW}⚠️  netlify.toml 不存在，将使用默认配置${NC}"
fi

if [ -f "_headers" ]; then
    cp _headers deploy_package/
    echo -e "${GREEN}✓ _headers${NC}"
else
    echo -e "${YELLOW}⚠️  _headers 不存在${NC}"
fi

# 复制测试文件夹（如果存在）
if [ -d "test" ]; then
    cp -r test deploy_package/
    echo -e "${GREEN}✓ 复制 test 目录${NC}"
fi

# 添加版本信息文件
echo "# 蓝牙指令代码生成器 - 版本信息" > deploy_package/VERSION.txt
echo "部署时间: $(date)" >> deploy_package/VERSION.txt
echo "版本戳: ${VERSION_TIMESTAMP}" >> deploy_package/VERSION.txt
echo "构建时间: ${BUILD_TIME}" >> deploy_package/VERSION.txt
echo "Git提交: ${GIT_COMMIT}" >> deploy_package/VERSION.txt
echo "Git分支: $(git branch --show-current 2>/dev/null || echo 'unknown')" >> deploy_package/VERSION.txt
echo "操作系统: $(uname -s)" >> deploy_package/VERSION.txt
echo "部署脚本版本: 2.0" >> deploy_package/VERSION.txt
echo "" >> deploy_package/VERSION.txt
echo "# 自动生成的版本文件，用于版本检测" >> deploy_package/VERSION.txt

echo -e "${GREEN}✅ 部署文件准备完成（版本: ${VERSION_TIMESTAMP}）${NC}"

# 显示部署包内容
echo -e "${BLUE}📄 部署包内容:${NC}"
ls -la deploy_package/
echo -e "${BLUE}📄 JS 文件:${NC}"
ls -la deploy_package/js/

# 部署网站
echo -e "${BLUE}🌐 开始部署网站...${NC}"
echo -e "${YELLOW}注意: 如果是首次部署，请选择现有站点或创建新站点${NC}"
echo ""

# 执行部署
netlify deploy --dir=deploy_package --prod

# 检查部署结果
DEPLOY_EXIT_CODE=$?
if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 部署成功完成！（版本: ${VERSION_TIMESTAMP}）${NC}"
    echo -e "${BLUE}你的网站地址已显示在上方输出中${NC}"
    echo -e "${GREEN}✨ 所有静态资源已添加版本号，用户将立即看到最新版本${NC}"
    
    # 清理临时文件
    echo ""
    echo -e "${BLUE}🧹 清理临时文件...${NC}"
    
    # 显示清理前的文件
    echo -e "${YELLOW}清理前的临时文件:${NC}"
    du -sh deploy_package/
    
    # 删除临时文件
    rm -rf deploy_package
    
    if [ ! -d "deploy_package" ]; then
        echo -e "${GREEN}✅ 临时文件清理完成${NC}"
    else
        echo -e "${RED}❌ 临时文件清理失败${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🚀 部署流程全部完成！${NC}"
    echo -e "${BLUE}💡 提示: 用户现在将获取到版本 ${VERSION_TIMESTAMP} 的最新内容${NC}"
    
else
    echo -e "${RED}❌ 部署失败 (退出码: $DEPLOY_EXIT_CODE)${NC}"
    echo -e "${YELLOW}⚠️  保留临时文件以便调试: ./deploy_package/${NC}"
    echo -e "${BLUE}请检查错误信息并重试${NC}"
    exit $DEPLOY_EXIT_CODE
fi 