<template>
    <li>
        <!-- 树节点 -->
        <div class="tree-node" :class="{ selected: isSelected }" @click="handleClick">
            <template v-if="node.children.length > 0">
                <!-- 展开/收起图标 -->
                <i :class="{ 'fas fa-plus icon': !node.open, 'fas fa-minus icon': node.open }"
                    style="margin-right: 0.5rem;"></i>
                <!-- 节点名称 -->
                {{ node.name }}
            </template>
            <template v-else>
                <span style="margin-right: 1.3rem;"></span>
                {{ node.name }}
            </template>

        </div>
        <!-- 如果节点有子节点并且节点是展开的，显示子节点 -->
        <ul v-if="node.children && node.open" class="nested">
            <tree-node v-for="child in node.children" :key="child.id" :node="child" @toggle="toggle"
                @selectNode="selectNode" :selectedNodeId="selectedNodeId" />
        </ul>
    </li>
</template>

<script setup>
import { computed } from 'vue';
import TreeNode from './TreeNode.vue';
// 接收 props
const props = defineProps({
    node: {
        type: Object,
        required: true,
    },
    selectedNodeId: {
        type: [String, Number],
        default: null,
    },
});

// 计算属性判断当前节点是否被选中
const isSelected = computed(() => {
    props.node.id === props.selectedNodeId
});

// 触发事件以切换节点展开状态
const toggle = (node) => {
    emit('toggle', node);
};

// 处理节点点击事件
const handleClick = () => {
    emit('selectNode', props.node); // 触发选择节点事件
    toggle(props.node); // 切换节点展开/收起状态
};

const selectNode = (node) => {
    emit('selectNode', node); // 触发选择节点事件
}

// 定义事件发射器
const emit = defineEmits(['toggle', 'selectNode']);
</script>

<style scoped>
/* 树节点的样式 */
.tree-node {
    display: flex;
    /* 使用flex布局 */
    align-items: center;
    /* 垂直居中对齐 */
    cursor: pointer;
    /* 鼠标悬停时显示手型 */
    padding: 0.5rem 0;
    /* 上下内边距 */
    transition: background-color 0.3s;
    /* 背景颜色过渡效果 */
}

/* 鼠标悬停时的背景颜色 */
.tree-node:hover {
    background-color: #f0f0f0;
}

/* 选中的树节点背景颜色 */
.tree-node.selected {
    background-color: #d9edf7;
}

/* 右箭头图标 */
.icon-chevron-right::before {
    content: "\f054";
    /* FontAwesome 右箭头 */
    font-family: "Font Awesome 5 Free";
    /* 使用Font Awesome字体 */
    font-weight: 900;
    /* 字体粗体 */
    margin-right: 0.5rem;
    /* 右边距 */
}

/* 下箭头图标 */
.icon-chevron-down::before {
    content: "\f078";
    /* FontAwesome 下箭头 */
    font-family: "Font Awesome 5 Free";
    /* 使用Font Awesome字体 */
    font-weight: 900;
    /* 字体粗体 */
    margin-right: 0.5rem;
    /* 右边距 */
}

/* 子节点的样式 */
.nested {
    list-style: none;
    /* 去掉默认列表样式 */
    padding-left: 1rem;
    /* 左内边距 */
    transition: all 0.3s ease;
    /* 过渡效果 */
}
</style>