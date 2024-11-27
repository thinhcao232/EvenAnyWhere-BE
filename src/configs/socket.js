const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
        },
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Xử lý khi nhận thông báo từ admin
        socket.on('sendNotification', (data) => {
            console.log('Notification received:', data);
            io.emit('receiveNotification', data); // Gửi thông báo tới tất cả các client
        });

        // Xử lý khi user ngắt kết nối
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

const getIO = () => {
    if (!io) throw new Error('Socket.io chưa được khởi tạo!');
    return io;
};

module.exports = { initSocket, getIO };