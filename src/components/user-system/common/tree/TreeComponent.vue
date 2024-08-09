<template>
    <div>
        <ul class="tree">
            <tree-node v-for="node in treeData" :key="node.id" :node="node" @toggle="toggle"
                @selectNode="handleSelectNode" :selectedNodeId="selectedNodeId">
            </tree-node>
        </ul>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import TreeNode from './TreeNode.vue';

export default defineComponent({
    components: {
        TreeNode,
    },
    props: {
        treeData: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            selectedNodeId: null,
        };
    },
    methods: {
        toggle(node) {
            node.open = !node.open;
        },
        handleSelectNode(node) {
            this.selectedNodeId = node.id;
            this.$emit('selectNode', node);
        },
    },
});
</script>

<style scoped>
.tree {
    list-style: none;
    padding-left: 1rem;
}
</style>