
    const mongoose = require('mongoose');

    async function conectarDB() {
        if (!process.env.MONGODB_URI) {
            throw new Error('Falta MONGODB_URI en las variables de entorno');
        }

        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conexión exitosa a MongoDB Atlas');
        return mongoose.connection;
    }

    module.exports = conectarDB;