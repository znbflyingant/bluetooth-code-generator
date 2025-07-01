#!/bin/bash

# 快速部署脚本 - 一键更新版本并部署
# 集成版本管理和强制刷新功能

echo "⚡ 快速部署工具 - 蓝牙指令代码生成器"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 显示当前状态
echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}    🚀 快速部署和版本管理工具${NC}"
echo -e "${BLUE}===========================================${NC}"

# 检查必要的工具
echo -e "${PURPLE}📋 检查必要工具...${NC}"

MISSING_TOOLS=()

if ! command -v git &> /dev/null; then
    MISSING_TOOLS+=("git")
fi

if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}⚠️  Netlify CLI 未安装，将在部署时安装${NC}"
fi

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo -e "${RED}❌ 缺少必要工具: ${MISSING_TOOLS[*]}${NC}"
    echo -e "${BLUE}请先安装这些工具再继续${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 工具检查完成${NC}"

# 获取 Git 状态
echo -e "\n${PURPLE}📊 检查 Git 状态...${NC}"
git status --porcelain | head -5

if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  检测到未提交的更改${NC}"
    read -p "是否先提交更改？(y/N): " commit_choice
    
    if [[ $commit_choice =~ ^[Yy]$ ]]; then
        read -p "请输入提交消息: " commit_msg
        git add .
        git commit -m "${commit_msg:-自动提交 - 快速部署}"
        echo -e "${GREEN}✅ 更改已提交${NC}"
    fi
fi

# 生成版本信息
echo -e "\n${PURPLE}🔢 生成版本信息...${NC}"
VERSION_TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BUILD_TIME=$(date +"%Y-%m-%d %H:%M:%S")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo 'main')

echo -e "${BLUE}   版本戳: ${VERSION_TIMESTAMP}${NC}"
echo -e "${BLUE}   构建时间: ${BUILD_TIME}${NC}"
echo -e "${BLUE}   Git提交: ${GIT_COMMIT}${NC}"
echo -e "${BLUE}   Git分支: ${GIT_BRANCH}${NC}"

# 选择操作模式
echo -e "\n${PURPLE}🛠️  选择操作模式：${NC}"
echo "1) 🚀 完整部署（推荐）"
echo "2) 🔄 本地测试版本更新"
echo "3) 🧪 只更新版本信息"
echo "4) 📊 查看当前版本状态"
echo "5) ❌ 取消"

read -p "请选择 (1-5): " mode_choice

case $mode_choice in
    1)
        echo -e "\n${GREEN}🚀 开始完整部署流程...${NC}"
        
        # 备份原始文件
        if [ ! -f "code_generator.html.backup" ]; then
            cp code_generator.html code_generator.html.backup
            echo -e "${GREEN}✅ 创建HTML备份${NC}"
        fi
        
        # 运行完整部署脚本
        echo -e "${BLUE}📦 运行 Netlify 部署脚本...${NC}"
        if [ -f "./netlify_deploy.sh" ]; then
            chmod +x ./netlify_deploy.sh
            ./netlify_deploy.sh
        else
            echo -e "${RED}❌ 找不到 netlify_deploy.sh${NC}"
            exit 1
        fi
        ;;
        
    2)
        echo -e "\n${BLUE}🔄 本地测试模式...${NC}"
        
        # 运行本地版本更新脚本
        if [ -f "./update_version.sh" ]; then
            chmod +x ./update_version.sh
            ./update_version.sh
        else
            echo -e "${RED}❌ 找不到 update_version.sh${NC}"
            exit 1
        fi
        ;;
        
    3)
        echo -e "\n${BLUE}🧪 只更新版本信息...${NC}"
        
        # 更新HTML版本信息
        if [ -f "code_generator.html" ]; then
            # 创建备份
            if [ ! -f "code_generator.html.backup" ]; then
                cp code_generator.html code_generator.html.backup
            fi
            
            # 恢复到原始状态再更新
            cp code_generator.html.backup code_generator.html
            
            # 替换版本占位符
            sed -i.tmp "s/BUILD_VERSION_PLACEHOLDER/${VERSION_TIMESTAMP}/g" code_generator.html
            sed -i.tmp "s/BUILD_TIME_PLACEHOLDER/${BUILD_TIME}/g" code_generator.html
            rm -f code_generator.html.tmp
            
            echo -e "${GREEN}✅ HTML版本信息已更新${NC}"
        fi
        
        # 更新VERSION.txt
        cat > VERSION.txt << EOF
# 蓝牙指令代码生成器 - 版本信息
部署时间: $(date)
版本戳: ${VERSION_TIMESTAMP}
构建时间: ${BUILD_TIME}
Git提交: ${GIT_COMMIT}
Git分支: ${GIT_BRANCH}
操作系统: $(uname -s)
模式: 版本信息更新

# 自动生成的版本文件
EOF
        echo -e "${GREEN}✅ VERSION.txt 已更新${NC}"
        ;;
        
    4)
        echo -e "\n${BLUE}📊 当前版本状态：${NC}"
        
        # 从HTML文件读取当前版本
        if [ -f "code_generator.html" ]; then
            current_version=$(grep 'meta name="app-version"' code_generator.html | sed 's/.*content="//;s/".*//')
            build_time=$(grep 'meta name="build-time"' code_generator.html | sed 's/.*content="//;s/".*//')
            
            echo -e "${GREEN}   HTML中的版本: ${current_version}${NC}"
            echo -e "${GREEN}   构建时间: ${build_time}${NC}"
        fi
        
        # 显示VERSION.txt内容
        if [ -f "VERSION.txt" ]; then
            echo -e "\n${BLUE}📄 VERSION.txt 内容:${NC}"
            cat VERSION.txt
        fi
        
        # 显示最近的Git提交
        echo -e "\n${BLUE}📝 最近的Git提交:${NC}"
        git log --oneline -5
        ;;
        
    5)
        echo -e "${YELLOW}❌ 操作已取消${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

# 完成后的操作建议
echo -e "\n${GREEN}🎉 操作完成！${NC}"
echo -e "\n${BLUE}💡 后续建议:${NC}"
echo -e "${BLUE}• 检查网站是否正常访问${NC}"
echo -e "${BLUE}• 在浏览器中验证版本号显示${NC}"
echo -e "${BLUE}• 测试版本检测功能是否工作${NC}"

# 提供测试选项
echo -e "\n${PURPLE}🧪 是否需要测试缓存配置？${NC}"
read -p "输入网站URL进行测试（按Enter跳过）: " test_url

if [ -n "$test_url" ]; then
    if [ -f "./test_cache.sh" ]; then
        chmod +x ./test_cache.sh
        ./test_cache.sh "$test_url"
    else
        echo -e "${YELLOW}⚠️  找不到 test_cache.sh，跳过缓存测试${NC}"
    fi
fi

echo -e "\n${GREEN}✨ 快速部署流程结束！${NC}" 