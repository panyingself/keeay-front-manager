<template>
    <div>
        <!-- 遍历传入的节点数据 -->
        <div v-for="node in nodes" :key="node.code">
            <div class="form-check">
                <!-- 复选框绑定 localSelectedValues -->
                <input class="form-check-input" type="checkbox" :id="'item-' + node.code" :value="node.code"  v-model="localSelectedValues"/>
                <label class="form-check-label" :for="'item-' + node.code">
                    {{ node.name }} 
                </label>
            </div>
            <!-- 如果节点有子节点，则递归渲染子节点 -->
            <ul v-if="node.children && node.children.length" class="ms-4">
                <TreeNode :nodes="node.children" :selected-values="localSelectedValues" @update:selected-values="updateSelectedValues" />
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import TreeNode from './DropdownTreeNode.vue';

// 定义组件的 props
const props = defineProps({
    nodes: {
        type: Array,
        default: () => [],
    },
    selectedValues: {
        type: Array,
        default: () => [],
    },
});

// 定义组件的 emits
const emit = defineEmits(['update:selected-values']);

const updateSelectedValues = (newValues) => {
    const arr = newValues.concat(localSelectedValues.value);
    const end = Array.from(new Set(arr));
    if(JSON.stringify(end) != JSON.stringify(localSelectedValues.value)){
        localSelectedValues.value = end;
    }
    emit('update:selected-values', localSelectedValues.value);
}

// 使用 ref 定义响应式数据
const localSelectedValues = ref([...props.selectedValues]);

// 监听 props.selectedValues 的变化，并更新 localSelectedValues
// watch(() => props.selectedValues, (newValues) => {
//     localSelectedValues.value = [...newValues];
// });

// 监听 localSelectedValues 的变化，并触发 update:selected-values 事件
watch(localSelectedValues, (newValues) => {
    // emit('update:selected-values', newValues);
    updateSelectedValues(newValues)
});
</script>

<style scoped>
.form-check-label {
    color: #2a6f2a; /* 深绿色文字 */
}
</style>
