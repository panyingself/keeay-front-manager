<template>
    <!-- 父级数据行 -->
    <template v-if="item">
        <tr :class="['table-row', { 'child-row': level > 0 }]">
            <template v-for="column in columns" :key="column.value" class="fixed-column">
                <template v-if="column.iconFlag == true">
                    <td :style="{ paddingLeft: (level + 1) * 20 + 'px' }">
                        <!-- 只有在有子项时才显示图标 -->
                        <span v-if="hasChildren" class="toggle-icon" @click.stop="toggleChildren">
                            <i v-if="item.showChildren" class="fas fa-minus icon"></i>
                            <i v-else class="fas fa-plus icon"></i>
                        </span>
                        <span v-else class="icon-placeholder"></span> <!-- 占位的空白图标位置 -->
                        {{ item[column.value] }} <!-- 示例数据，替换为实际列数据 -->
                    </td>
                </template>
                <template v-else>
                    <td>
                        {{ item[column.value] }}
                    </td>
                </template>
            </template>

            <td class="action-column">
                <button @click="addOperation(item)" class="btn btn-sm btn-info">新增</button>
                <button @click="editOperation(item)" class="btn btn-sm btn-warning"
                    style="margin-left: 5px;">编辑</button>
                <button @click="confirmDelete(item)" class="btn btn-sm btn-danger"
                    style="margin-left: 5px;">删除</button>
            </td>
        </tr>

        <!-- 递归渲染子级数据行 -->
        <template v-if="item.children && item.showChildren">
            <RecursiveItem v-for="child in item.children" :key="child.id" :item="child" :columns="columns"
                :level="level + 1" @show-add-modal="addOperation" @show-edit-modal="editOperation"
                @delete-item="deleteOperation" />
        </template>
    </template>
</template>


<script setup>
import { defineProps, defineEmits, computed, ref } from 'vue';

const props = defineProps({
    item: Object,
    columns: Array,
    level: Number
});

const emits = defineEmits(['show-edit-modal', 'show-add-modal', 'delete-item']);

const hasChildren = computed(() => props.item.children && props.item.children.length > 0);

const toggleChildren = () => {
    props.item.showChildren = !props.item.showChildren;
};

const addOperation = (item) => {
    emits('show-add-modal', item);
};

const editOperation = (item) => {
    emits('show-edit-modal', item);
};

const deleteOperation = (item) => {
    emits('delete-item', item);
};

const confirmDelete = (item) => {
    if (window.confirm("您确定要删除这项吗？此操作不可恢复。")) {
        deleteOperation(item);
    }
};
</script>


<style scoped>
.toggle-icon {
    cursor: pointer;
    margin-right: 5px;
    /* 调整图标与文字之间的间距 */
}

.icon {
    font-size: 18px;
    /* 调整图标大小 */
    transition: transform 0.2s ease; /* 添加动画效果 */
}

.icon-placeholder {
    display: inline-block;
    width: 18px;
    /* 占位图标的宽度，保持与实际图标一致 */
    height: 18px;
    /* 占位图标的高度，保持与实际图标一致 */
}

.table-row:hover {
    background-color: rgba(97, 208, 142, 0.423);
}

</style>
