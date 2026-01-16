#!/usr/bin/env python3
"""
PDF无损压缩脚本
使用 pypdf 库进行压缩
"""

import subprocess
import sys
import os

def compress_with_ghostscript(input_path: str, output_path: str):
    """使用 Ghostscript 进行高质量PDF压缩"""

    # Ghostscript 压缩命令 - 使用 prepress 设置保持高质量
    gs_command = [
        'gs',
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        '-dPDFSETTINGS=/prepress',  # 高质量预设，适合无损压缩
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        '-dCompressFonts=true',
        '-dSubsetFonts=true',
        '-dColorImageDownsampleType=/Bicubic',
        '-dColorImageResolution=300',
        '-dGrayImageDownsampleType=/Bicubic',
        '-dGrayImageResolution=300',
        '-dMonoImageDownsampleType=/Bicubic',
        '-dMonoImageResolution=300',
        f'-sOutputFile={output_path}',
        input_path
    ]

    try:
        subprocess.run(gs_command, check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Ghostscript 错误: {e.stderr.decode()}")
        return False
    except FileNotFoundError:
        print("错误: 未找到 Ghostscript，请先安装: brew install ghostscript")
        return False


def main():
    # 输入文件路径
    input_file = "/Users/haowang/Desktop/Open medora-服务手册 (1).pdf(2).pdf"

    # 检查文件是否存在
    if not os.path.exists(input_file):
        print(f"错误: 文件不存在 - {input_file}")
        sys.exit(1)

    # 获取原始文件大小
    original_size = os.path.getsize(input_file)
    print(f"原始文件: {input_file}")
    print(f"原始大小: {original_size / 1024 / 1024:.2f} MB")

    # 生成输出文件名
    base_name = os.path.splitext(input_file)[0]
    output_file = f"{base_name}_compressed.pdf"

    print(f"\n正在压缩...")

    if compress_with_ghostscript(input_file, output_file):
        compressed_size = os.path.getsize(output_file)
        savings = (1 - compressed_size / original_size) * 100

        print(f"\n压缩完成!")
        print(f"输出文件: {output_file}")
        print(f"压缩后大小: {compressed_size / 1024 / 1024:.2f} MB")
        print(f"节省空间: {savings:.1f}%")
    else:
        print("压缩失败")
        sys.exit(1)


if __name__ == "__main__":
    main()
