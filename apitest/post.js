const axios = require('axios');

// 定义请求的 URL
const url = 'http://127.0.0.1:8000/login';

// 定义要发送的数据
const data = {
    username: 'user',
    password: '123456'
};

// 设置请求头（可选）
const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

// 使用 axios 发起 POST 请求
axios.post(url, data, {headers})
    .then(response => {
        console.log('请求成功:', response.data);
    })
    .catch(error => {
        console.error('请求失败:', error);
    });
