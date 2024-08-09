<template>
    <!-- TreeSelect 组件 -->
    <a-tree-select 
        v-model:value="value" 
        style="width: 100%" 
        :tree-data="formattedTreeData" 
        tree-checkable 
        allow-clear
        :show-checked-strategy="SHOW_PARENT" 
        search-placeholder="请选择" />
</template>

<script lang="ts">
import { TreeSelect } from 'ant-design-vue';
import { defineComponent, ref, computed } from 'vue';

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

// 定义外部数据的接口
interface ExternalTreeDataItem {
    code: string;
    name?: string;
    disabled?: boolean;
    children?: ExternalTreeDataItem[];
}

// 外部数据示例
const externalTreeData: ExternalTreeDataItem[] = [
    {
        name: '节点1',
        code: '0-0',
        children: [
            {
                name: '子节点1',
                code: '0-0-0',
            },
        ],
    },
    {
        name: '节点2',
        code: '0-1',
        children: [
            {
                name: '子节点2',
                code: '0-1-0',
            },
        ],
    },
];

export default defineComponent({
    setup() {
        // 选中的值
        const value = ref<string[]>(['0-0-0']);

        // 计算属性：将外部数据格式转换为 TreeSelect 组件需要的格式
        const formattedTreeData = computed(() => {
            return externalTreeData.map(item => formatTreeData(item));
        });

        // 格式化函数：将外部数据格式转换为 TreeSelect 组件要求的格式
        function formatTreeData(item: ExternalTreeDataItem): any {
            return {
                title: item.name || '', // 显示名称
                key: item.code, // 唯一标识
                disabled: item.disabled || false, // 是否禁用
                children: item.children ? item.children.map(child => formatTreeData(child)) : [], // 递归处理子节点
            };
        }

        // 返回模板中使用的属性和方法
        return {
            value,
            formattedTreeData,
            SHOW_PARENT,
        };
    },
});
</script>

<style scoped>
/* 你可以在这里添加样式 */
</style>
