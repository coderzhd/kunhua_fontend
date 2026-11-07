// 定义请求的 URL
const axios = require('axios');

const url = 'http://127.0.0.1:8000';

// 定义要携带的参数
const params = {
    username: 'user1',
    password: '123456'
};

// 使用 axios 发起 GET 请求
axios.get(url, { params })
    .then(response => {
        console.log('请求成功:', response.data);
    })
    .catch(error => {
        console.error('请求失败:', error);
    });