<template>
    <div v-if="!show" class="modal-mask">
        <div class="modal-wrapper">
            <div class="modal-container">
                <!-- 模态框头部 -->
                <div class="modal-header">
                    <div class="header-content">
                        <slot name="header"></slot>
                    </div>
                    <!-- <button class="close" @click="$emit('close')">×</button> -->
                </div>
                <!-- 模态框主体 -->
                <div class="modal-body">
                    <slot name="body"></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    show: Boolean,
});
</script>

<style scoped>
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-wrapper {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    width: 60%;
    max-width: 500px;
}

.modal-container {
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #4caf50;
    color: white;
    border-bottom: 1px solid #e0e0e0;
}

.header-content {
    display: flex;
    align-items: center;
}

/* .modal-body {
    padding: 20px;
    background: #f9f9f9;
} */

.close {
    cursor: pointer;
    background: none;
    border: none;
    font-size: 1.5em;
    color: #ffffff;
    transition: color 0.3s;
}

.close:hover {
    color: #bbbbbb;
}
</style>