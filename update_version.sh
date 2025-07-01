#!/bin/bash

# 本地开发版本更新脚本
# 用于测试版本管理功能

echo "🔧 本地版本更新工具"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 生成新版本号
NEW_VERSION=$(date +"%Y%m%d%H%M%S")
BUILD_TIME=$(date +"%Y-%m-%d %H:%M:%S")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo 'dev')

echo -e "${BLUE}🆕 生成新版本: ${NEW_VERSION}${NC}"
echo -e "${BLUE}🕒 构建时间: ${BUILD_TIME}${NC}"
echo -e "${BLUE}📝 Git提交: ${GIT_COMMIT}${NC}"

# 备份原始文件
if [ ! -f "code_generator.html.backup" ]; then
    echo -e "${YELLOW}📦 创建HTML备份...${NC}"
    cp code_generator.html code_generator.html.backup
fi

# 更新HTML文件中的版本信息
echo -e "${BLUE}🔄 更新版本信息...${NC}"

# 恢复到原始状态
cp code_generator.html.backup code_generator.html

# 替换版本占位符
sed -i.tmp "s/BUILD_VERSION_PLACEHOLDER/${NEW_VERSION}/g" code_generator.html
sed -i.tmp "s/BUILD_TIME_PLACEHOLDER/${BUILD_TIME}/g" code_generator.html

# 删除临时文件
rm -f code_generator.html.tmp

# 更新VERSION.txt文件
echo -e "${BLUE}📄 更新VERSION.txt...${NC}"

cat > VERSION.txt << EOF
# 蓝牙指令代码生成器 - 版本信息
部署时间: $(date)
版本戳: ${NEW_VERSION}
构建时间: ${BUILD_TIME}
Git提交: ${GIT_COMMIT}
Git分支: $(git branch --show-current 2>/dev/null || echo 'main')
操作系统: $(uname -s)
部署脚本版本: 2.0 (开发模式)

# 本地开发版本文件
EOF

echo -e "${GREEN}✅ 版本更新完成！${NC}"
echo -e "${BLUE}💡 现在可以刷新浏览器测试版本检测功能${NC}"
echo -e "${BLUE}🌐 在浏览器控制台中输入以下命令测试：${NC}"
echo -e "${YELLOW}   versionManager.checkForUpdates()${NC}"
echo -e "${YELLOW}   versionManager.getVersionInfo()${NC}"

# 提供选择菜单
echo ""
echo -e "${BLUE}选择下一步操作：${NC}"
echo "1) 打开浏览器测试"
echo "2) 还原到备份版本"
echo "3) 启动本地服务器"
echo "4) 退出"

read -p "请选择 (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}🌐 正在打开浏览器...${NC}"
        if command -v open &> /dev/null; then
            open code_generator.html
        elif command -v xdg-open &> /dev/null; then
            xdg-open code_generator.html
        else
            echo -e "${YELLOW}请手动打开 code_generator.html${NC}"
        fi
        ;;
    2)
        echo -e "${BLUE}🔄 还原到备份版本...${NC}"
        if [ -f "code_generator.html.backup" ]; then
            cp code_generator.html.backup code_generator.html
            echo -e "${GREEN}✅ 已还原到原始版本${NC}"
        else
            echo -e "${RED}❌ 找不到备份文件${NC}"
        fi
        ;;
    3)
        echo -e "${BLUE}🚀 启动本地服务器...${NC}"
        if command -v python3 &> /dev/null; then
            echo -e "${GREEN}使用 Python3 启动服务器在 http://localhost:8000${NC}"
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            echo -e "${GREEN}使用 Python2 启动服务器在 http://localhost:8000${NC}"
            python -m SimpleHTTPServer 8000
        else
            echo -e "${RED}❌ 找不到 Python，请安装 Python 或使用其他方式启动服务器${NC}"
        fi
        ;;
    4)
        echo -e "${GREEN}👋 再见！${NC}"
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        ;;
esac 