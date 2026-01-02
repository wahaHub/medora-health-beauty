#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
清理所有非英语的翻译数据
保留英语(en)数据，删除其他所有语言的翻译
"""

from supabase import create_client, Client

# Supabase 配置
SUPABASE_URL = "https://yamlikuqgmqiigeaqzaz.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA4MDIzMywiZXhwIjoyMDgyNjU2MjMzfQ.n2CGlu8qhDEjEM6pKJF79yv9C3DTQ3qF0PnJMHUJu7w"

# 需要清理的表（删除所有 language_code != 'en' 的记录）
TABLES_TO_CLEAN = [
    'procedure_translations',
    'procedure_recovery',
    'procedure_benefits',
    'procedure_candidacy',
    'procedure_techniques',
    'procedure_recovery_timeline',
    'procedure_recovery_tips',
    'complementary_procedures',
    'procedure_risks'
]

def cleanup_non_english_data(supabase: Client, silent: bool = False) -> int:
    """删除所有非英语翻译数据
    
    Args:
        supabase: Supabase 客户端
        silent: 是否静默模式（不打印详细信息）
    
    Returns:
        删除的总记录数
    """
    if not silent:
        print("🧹 开始清理非英语翻译数据...")
        print("=" * 70)
    
    total_deleted = 0
    
    for table_name in TABLES_TO_CLEAN:
        try:
            if not silent:
                print(f"\n📋 清理表: {table_name}")
            
            # 先查询有多少条非英语记录
            count_result = supabase.table(table_name)\
                .select('id', count='exact')\
                .neq('language_code', 'en')\
                .execute()
            
            count = count_result.count if count_result.count else 0
            
            if count == 0:
                if not silent:
                    print(f"   ✓ 没有非英语数据")
                continue
            
            if not silent:
                print(f"   发现 {count} 条非英语记录")
            
            # 删除非英语记录
            supabase.table(table_name)\
                .delete()\
                .neq('language_code', 'en')\
                .execute()
            
            if not silent:
                print(f"   ✅ 已删除 {count} 条记录")
            total_deleted += count
            
        except Exception as e:
            if not silent:
                print(f"   ❌ 错误: {str(e)}")
            continue
    
    if not silent:
        print("\n" + "=" * 70)
        print(f"🎉 清理完成！共删除 {total_deleted} 条非英语记录")
        print(f"✅ 英语(en)数据已保留")
    
    return total_deleted

def main():
    """主函数"""
    print("\n" + "=" * 70)
    print("清理非英语翻译数据")
    print("=" * 70)
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"要清理的表: {len(TABLES_TO_CLEAN)} 个")
    print("=" * 70)
    
    # 确认
    response = input("\n⚠️  确认要删除所有非英语翻译数据吗？(输入 yes 继续): ")
    if response.lower() != 'yes':
        print("❌ 已取消")
        return
    
    # 创建 Supabase 客户端
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    # 执行清理
    cleanup_non_english_data(supabase, silent=False)
    
    print("\n现在可以运行 python import-i18n-to-supabase-v2.py 重新插入翻译数据")

if __name__ == "__main__":
    main()
