<template>
    <div class="pagination-container">
        <div class="page-size-selector">
            <label for="pageSize">每页展示:</label>
            <select id="pageSize" v-model="localPageSize" @change="changePageSize">
                <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
            </select>
        </div>
        <div class="pagination">
            <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
            <span v-for="page in pages" :key="page" :class="{ active: page === currentPage, ellipsis: page === '...' }"
                @click="changePage(page)" v-if="page !== '...'" class="page-number">
                {{ page }}
            </span>
            <span v-else class="ellipsis">...</span>
            <button :disabled="currentPage === totalPages || currentPage === 0 || totalPages === 0"
                @click="changePage(currentPage + 1)">下一页</button>
        </div>
        <div class="pagination-info">
            <span>共 {{ totalCount }} 条</span>
            <span>共 {{ totalPages }} 页</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
    totalCount: {
        type: Number,
        required: true,
    },
    currentPage: {
        type: Number,
        required: true,
    },
    pageSize: {
        type: Number,
        default: 10,
    },
    pageSizeOptions: {
        type: Array,
        default: () => [1, 10, 20, 50, 100]
    }
});

const emits = defineEmits(['change', 'update:pageSize']);

const totalPages = computed(() => Math.ceil(props.totalCount / localPageSize.value));
const localPageSize = ref(props.pageSize);

const changePage = (page) => {
    if (page > 0 && page <= totalPages.value && page !== props.currentPage) {
        emits('change', page);
    }
};

const changePageSize = () => {
    emits('update:pageSize', localPageSize.value);
    emits('change', 1); // 重置到第一页
};

const pages = computed(() => {
    let range = [];
    let start = Math.max(1, props.currentPage - 2);
    let end = Math.min(totalPages.value, props.currentPage + 2);

    if (start > 1) {
        range.push(1);
        if (start > 2) range.push('...');
    }

    for (let i = start; i <= end; i++) {
        range.push(i);
    }

    if (end < totalPages.value) {
        if (end < totalPages.value - 1) range.push('...');
        range.push(totalPages.value);
    }

    return range;
});

watch(() => props.pageSize, (newVal) => {
    localPageSize.value = newVal;
});
</script>

<style scoped>
.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    font-family: Arial, sans-serif;
}

.page-size-selector {
    display: flex;
    align-items: center;
    margin-right: 16px;
}

.page-size-selector label {
    margin-right: 8px;
    color: #34495e;
}

.page-size-selector select {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #bdc3c7;
    background-color: #ecf0f1;
    color: #34495e;
    cursor: pointer;
    transition: border-color 0.3s;
}

.page-size-selector select:hover {
    border-color: #007bff;
}

.pagination {
    display: flex;
    align-items: center;
    margin-right: 16px;
}

.pagination button {
    margin: 0 4px;
    padding: 6px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s, box-shadow 0.3s;
    /* border-radius: 4px; */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination button:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
}

.pagination .page-number {
    margin: 0 4px;
    padding: 6px 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s, box-shadow 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination .page-number.active {
    background-color: #007bff;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.pagination .page-number:hover:not(.active) {
    background-color: #ecf0f1;
}

.pagination .ellipsis {
    margin: 0 4px;
    padding: 6px 12px;
    cursor: default;
    color: #7f8c8d;
}

.pagination-info {
    font-size: 14px;
    color: #34495e;
}
</style>
