#!/bin/bash

# 缓存配置测试脚本
# 用于验证 Netlify 站点的缓存设置是否正确

echo "🧪 测试 Netlify 站点缓存配置..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 检查是否提供了网站URL
if [ -z "$1" ]; then
    echo -e "${RED}❌ 请提供网站URL${NC}"
    echo -e "${BLUE}用法: $0 <网站URL>${NC}"
    echo -e "${BLUE}例如: $0 https://your-site.netlify.app${NC}"
    exit 1
fi

SITE_URL="$1"
echo -e "${BLUE}🌐 测试网站: ${SITE_URL}${NC}"

# 测试函数
test_cache_headers() {
    local url="$1"
    local file_type="$2"
    local expected_cache="$3"
    
    echo -e "\n${BLUE}🔍 测试 $file_type 缓存设置...${NC}"
    
    # 获取响应头
    response=$(curl -s -I "$url" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        cache_control=$(echo "$response" | grep -i "cache-control" | cut -d' ' -f2-)
        
        if [ -n "$cache_control" ]; then
            echo -e "${GREEN}✓ Cache-Control: $cache_control${NC}"
            
            if echo "$cache_control" | grep -q "$expected_cache"; then
                echo -e "${GREEN}✅ 缓存配置正确${NC}"
            else
                echo -e "${YELLOW}⚠️  缓存配置可能需要调整${NC}"
                echo -e "${YELLOW}   期望包含: $expected_cache${NC}"
            fi
        else
            echo -e "${RED}❌ 未找到 Cache-Control 头${NC}"
        fi
        
        # 显示其他相关头信息
        etag=$(echo "$response" | grep -i "etag" | cut -d' ' -f2-)
        if [ -n "$etag" ]; then
            echo -e "${BLUE}🏷️  ETag: $etag${NC}"
        fi
        
        pragma=$(echo "$response" | grep -i "pragma" | cut -d' ' -f2-)
        if [ -n "$pragma" ]; then
            echo -e "${BLUE}🚫 Pragma: $pragma${NC}"
        fi
    else
        echo -e "${RED}❌ 无法访问 $url${NC}"
    fi
}

# 测试主页HTML
test_cache_headers "$SITE_URL" "HTML主页" "no-cache"

# 测试CSS文件（如果能找到）
echo -e "\n${BLUE}🔍 尝试检测CSS文件...${NC}"
css_file=$(curl -s "$SITE_URL" | grep -o 'href="[^"]*\.css[^"]*"' | head -1 | sed 's/href="//;s/"//')
if [ -n "$css_file" ]; then
    if [[ "$css_file" =~ ^http ]]; then
        css_url="$css_file"
    else
        css_url="${SITE_URL%/}/${css_file#/}"
    fi
    test_cache_headers "$css_url" "CSS文件" "max-age=300"
else
    echo -e "${YELLOW}⚠️  未找到CSS文件引用${NC}"
fi

# 测试JS文件（如果能找到）
echo -e "\n${BLUE}🔍 尝试检测JS文件...${NC}"
js_file=$(curl -s "$SITE_URL" | grep -o 'src="[^"]*\.js[^"]*"' | head -1 | sed 's/src="//;s/"//')
if [ -n "$js_file" ]; then
    if [[ "$js_file" =~ ^http ]]; then
        js_url="$js_file"
    else
        js_url="${SITE_URL%/}/${js_file#/}"
    fi
    test_cache_headers "$js_url" "JS文件" "max-age=300"
else
    echo -e "${YELLOW}⚠️  未找到JS文件引用${NC}"
fi

# 测试版本信息文件（如果存在）
echo -e "\n${BLUE}🔍 检查版本信息...${NC}"
version_url="${SITE_URL%/}/VERSION.txt"
version_response=$(curl -s -I "$version_url" 2>/dev/null)
if echo "$version_response" | grep -q "200"; then
    echo -e "${GREEN}✓ 找到版本信息文件${NC}"
    test_cache_headers "$version_url" "版本信息" "no-cache"
    
    # 显示版本内容
    echo -e "\n${BLUE}📄 版本信息内容:${NC}"
    curl -s "$version_url" | head -5
else
    echo -e "${YELLOW}⚠️  未找到版本信息文件${NC}"
fi

echo -e "\n${GREEN}🎉 缓存配置测试完成！${NC}"
echo -e "\n${BLUE}💡 建议:${NC}"
echo -e "${BLUE}• HTML文件应该设置为不缓存 (no-cache)${NC}"
echo -e "${BLUE}• CSS/JS文件应该有短期缓存 (max-age=300)${NC}"
echo -e "${BLUE}• 如果看到版本化的文件名(带时间戳)，说明版本化部署工作正常${NC}"
echo -e "${BLUE}• 强制刷新浏览器 (Ctrl+F5 或 Cmd+Shift+R) 可以绕过缓存${NC}" 