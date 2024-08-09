<template>
    <div class="dashboard">
        <!-- 面包屑导航区域 -->
        <nav aria-label="breadcrumb" class="breadcrumb-nav">
            <ol class="breadcrumb bg-transparent">
                <li class="breadcrumb-item"><a href="#" class="text-dark">首页</a></li>
            </ol>
        </nav>

        <!-- 主体内容区域 -->
        <div class="container-fluid mt-4">
            <div class="row">
                <!-- 图表区域 -->
                <div class="col-md-8 mb-4">
                    <div class="row">
                        <!-- 数据统计卡片 1 -->
                        <div class="col-md-4 mb-4">
                            <div class="card bg-gradient shadow-lg">
                                <div class="card-body">
                                    <h2 class="card-title mb-3">用户活跃度</h2>
                                    <div class="chart-container">
                                        <div id="chart1" class="chart"></div>
                                    </div>
                                    <p class="card-text">展示用户活跃度的统计图表。</p>
                                </div>
                            </div>
                        </div>

                        <!-- 数据统计卡片 2 -->
                        <div class="col-md-4 mb-4">
                            <div class="card bg-gradient shadow-lg">
                                <div class="card-body">
                                    <h2 class="card-title mb-3">系统负载</h2>
                                    <div class="chart-container">
                                        <div id="chart2" class="chart"></div>
                                    </div>
                                    <p class="card-text">展示系统负载的统计图表。</p>
                                </div>
                            </div>
                        </div>

                        <!-- 数据统计卡片 3 -->
                        <div class="col-md-4 mb-4">
                            <div class="card bg-gradient shadow-lg">
                                <div class="card-body">
                                    <h2 class="card-title mb-3">活跃用户分布</h2>
                                    <div class="chart-container">
                                        <div id="chart3" class="chart"></div>
                                    </div>
                                    <p class="card-text">展示活跃用户分布的统计图表。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 用户登录记录区域 -->
                <div class="col-md-4">
                    <div class="card shadow-lg h-100">
                        <div class="card-header bg-light">
                            <h3 class="card-title mb-0">用户登录记录</h3>
                        </div>
                        <div class="card-body">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>用户</th>
                                        <th>登录时间</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>用户A</td>
                                        <td>2024-07-22 08:30</td>
                                    </tr>
                                    <tr>
                                        <td>用户B</td>
                                        <td>2024-07-22 09:15</td>
                                    </tr>
                                    <tr>
                                        <td>用户C</td>
                                        <td>2024-07-22 10:00</td>
                                    </tr>
                                    <!-- 更多记录 -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import * as echarts from 'echarts';

onMounted(() => {
    // 用户活跃度图表
    const chart1 = echarts.init(document.getElementById('chart1'));
    chart1.setOption({
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        xAxis: {
            type: 'category',
            data: ['用户A', '用户B', '用户C', '用户D'],
            axisLine: { lineStyle: { color: '#aaa' } },
            axisLabel: { color: '#333' }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#aaa' } },
            axisLabel: { color: '#333' }
        },
        series: [{
            data: [10, 20, 30, 40],
            type: 'bar',
            itemStyle: {
                color: '#007bff'
            },
            emphasis: {
                itemStyle: {
                    color: '#0056b3'
                }
            }
        }]
    });

    // 系统负载图表
    const chart2 = echarts.init(document.getElementById('chart2'));
    chart2.setOption({
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月'],
            axisLine: { lineStyle: { color: '#aaa' } },
            axisLabel: { color: '#333' }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#aaa' } },
            axisLabel: { color: '#333' }
        },
        series: [{
            data: [15, 25, 35, 45],
            type: 'line',
            itemStyle: {
                color: '#ff5722'
            },
            emphasis: {
                itemStyle: {
                    color: '#e64a19'
                }
            }
        }]
    });

    // 活跃用户分布图表
    const chart3 = echarts.init(document.getElementById('chart3'));
    chart3.setOption({
        tooltip: {
            trigger: 'item'
        },
        series: [{
            type: 'pie',
            radius: '70%',
            data: [
                { value: 50, name: '地区A', itemStyle: { color: '#4caf50' } },
                { value: 25, name: '地区B', itemStyle: { color: '#2196f3' } },
                { value: 25, name: '地区C', itemStyle: { color: '#ffeb3b' } }
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    });
});
</script>

<style scoped>
/* 整体布局样式 */
.dashboard {
    padding: 16px;
}

.breadcrumb-nav {
    margin-bottom: 20px;
}

/* 卡片样式 */
.card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-radius: 15px;
    overflow: hidden;
}

.card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.card-body {
    color: #333;
}

/* 卡片背景渐变 */
.bg-gradient {
    background: linear-gradient(135deg, #6a11cb, #2575fc);
    color: #fff;
}

/* 图表容器 */
.chart-container {
    position: relative;
    height: 300px;
    /* 增加高度以适应图表 */
    margin-bottom: 16px;
}

.chart {
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 8px;
}

/* 用户登录记录样式 */
.table {
    margin-bottom: 0;
}

.table-striped tbody tr:nth-of-type(odd) {
    background-color: #f9f9f9;
}
</style>