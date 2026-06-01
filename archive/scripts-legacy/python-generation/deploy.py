#!/usr/bin/env python3
"""
Medora Beauty 一键部署脚本
同时部署前端网站和 Admin 后台
"""

import subprocess
import sys
import os
from datetime import datetime

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}→ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

def run_command(cmd, description, capture_output=False):
    """执行命令并显示结果"""
    print_info(f"{description}...")
    try:
        if capture_output:
            result = subprocess.run(cmd, shell=True, check=True,
                                  capture_output=True, text=True)
            return result.stdout.strip()
        else:
            subprocess.run(cmd, shell=True, check=True)
        print_success(f"{description} 完成")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"{description} 失败")
        if capture_output and e.stderr:
            print(f"{Colors.FAIL}{e.stderr}{Colors.ENDC}")
        return False

def check_git_status():
    """检查 Git 状态"""
    print_header("检查 Git 状态")

    # 检查是否有未提交的改动
    result = subprocess.run("git status --porcelain", shell=True,
                          capture_output=True, text=True)

    if result.stdout.strip():
        print_warning("发现未提交的改动：")
        print(result.stdout)

        response = input(f"\n{Colors.WARNING}是否要先提交这些改动? (y/n): {Colors.ENDC}")
        if response.lower() == 'y':
            commit_message = input(f"{Colors.OKCYAN}请输入 commit 信息: {Colors.ENDC}")
            if not commit_message:
                commit_message = f"部署更新 - {datetime.now().strftime('%Y-%m-%d %H:%M')}"

            if not run_command("git add .", "添加所有改动到暂存区"):
                return False
            if not run_command(f'git commit -m "{commit_message}"', "提交改动"):
                return False
        else:
            print_warning("跳过提交，继续部署...")
    else:
        print_success("工作区干净，没有未提交的改动")

    return True

def push_to_github():
    """推送到 GitHub"""
    print_header("推送到 GitHub")

    # 获取当前分支
    branch = run_command("git branch --show-current", "获取当前分支", capture_output=True)
    if not branch:
        branch = "main"

    print_info(f"当前分支: {branch}")

    if not run_command(f"git push origin {branch}", f"推送到 origin/{branch}"):
        return False

    print_success("代码已推送到 GitHub")
    return True

def build_frontend():
    """构建前端"""
    print_header("构建前端项目")

    # 检查 node_modules
    if not os.path.exists("node_modules"):
        print_warning("node_modules 不存在，正在安装依赖...")
        if not run_command("npm install", "安装 npm 依赖"):
            return False

    # 构建
    if not run_command("npm run build", "构建前端项目"):
        return False

    # 检查构建输出
    if not os.path.exists("dist"):
        print_error("构建失败：dist 目录不存在")
        return False

    # 检查 admin 文件是否存在
    if not os.path.exists("dist/admin/surgeons-manager.html"):
        print_error("Admin 文件未正确复制到 dist 目录")
        return False

    print_success("前端构建成功")
    print_info(f"  - React 应用已构建到 dist/")
    print_info(f"  - Admin 后台已复制到 dist/admin/")

    return True

def deploy_to_vercel():
    """部署到 Vercel"""
    print_header("部署到 Vercel")

    print_info("Vercel 将自动从 GitHub 拉取最新代码并部署")
    print_info("请访问 Vercel Dashboard 查看部署状态")
    print_info("URL: https://vercel.com")

    print_success("部署已触发（通过 GitHub push）")
    return True

def verify_deployment():
    """验证部署"""
    print_header("部署完成")

    print_success("🎉 部署流程已完成！")
    print()
    print_info("请等待 1-2 分钟让 Vercel 完成构建和部署")
    print()
    print(f"{Colors.OKGREEN}前端网站:{Colors.ENDC} https://www.medorabeauty.com")
    print(f"{Colors.OKGREEN}Admin 后台:{Colors.ENDC} https://www.medorabeauty.com/admin")
    print()
    print_info("验证步骤：")
    print("  1. 访问前端网站，检查功能是否正常")
    print("  2. 访问 Admin 后台，点击 Surgeons 查看是否能跳转")
    print("  3. 测试照片上传功能")
    print()

def main():
    """主函数"""
    print_header("Medora Beauty 部署工具")
    print(f"{Colors.OKCYAN}开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.ENDC}")

    # 检查是否在项目根目录
    if not os.path.exists("package.json"):
        print_error("错误：请在项目根目录运行此脚本")
        sys.exit(1)

    # 执行部署流程
    steps = [
        (check_git_status, "检查 Git 状态"),
        (push_to_github, "推送到 GitHub"),
        (build_frontend, "构建前端"),
        (deploy_to_vercel, "部署到 Vercel"),
    ]

    for step_func, step_name in steps:
        if not step_func():
            print_error(f"\n部署失败于步骤: {step_name}")
            sys.exit(1)

    verify_deployment()

    print(f"\n{Colors.OKCYAN}完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.ENDC}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}部署已取消{Colors.ENDC}")
        sys.exit(1)
    except Exception as e:
        print_error(f"\n发生错误: {str(e)}")
        sys.exit(1)
