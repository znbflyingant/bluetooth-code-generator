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

# 复制必要文件
echo -e "${BLUE}📋 复制项目文件...${NC}"

# 检查并复制主要文件
if [ -f "code_generator.html" ]; then
    cp code_generator.html deploy_package/
    echo -e "${GREEN}✓ code_generator.html${NC}"
else
    echo -e "${RED}❌ 找不到 code_generator.html${NC}"
    exit 1
fi

if [ -f "styles.css" ]; then
    cp styles.css deploy_package/
    echo -e "${GREEN}✓ styles.css${NC}"
else
    echo -e "${RED}❌ 找不到 styles.css${NC}"
    exit 1
fi

if [ -f "netlify.toml" ]; then
    cp netlify.toml deploy_package/
    echo -e "${GREEN}✓ netlify.toml${NC}"
else
    echo -e "${YELLOW}⚠️  netlify.toml 不存在，将使用默认配置${NC}"
fi

# 复制JavaScript文件
if [ -d "js" ]; then
    cp -r js/* deploy_package/js/
    JS_COUNT=$(ls js/*.js 2>/dev/null | wc -l)
    echo -e "${GREEN}✓ 复制了 $JS_COUNT 个 JavaScript 文件${NC}"
else
    echo -e "${RED}❌ 找不到 js 目录${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 部署文件准备完成${NC}"

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
    echo -e "${GREEN}🎉 部署成功完成！${NC}"
    echo -e "${BLUE}你的网站地址已显示在上方输出中${NC}"
    
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
    
else
    echo -e "${RED}❌ 部署失败 (退出码: $DEPLOY_EXIT_CODE)${NC}"
    echo -e "${YELLOW}⚠️  保留临时文件以便调试: ./deploy_package/${NC}"
    echo -e "${BLUE}请检查错误信息并重试${NC}"
    exit $DEPLOY_EXIT_CODE
fi 