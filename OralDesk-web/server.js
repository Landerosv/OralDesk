////////////////

    require('dotenv').config();
    const path = require('path');
    const express = require('express');
    const morgan = require('morgan');
    const conectarDB = require('./config/db');
    const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/errorHandler');

    if (!process.env.JWT_SECRET) {
        console.error('Falta JWT_SECRET en el archivo .env');
        process.exit(1);
    }

    const app = express();
    app.use(morgan('dev'));
    app.use(express.json());

    // Ruta de prueba
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/api/auth', require('./routes/auth'));
    // Errores (siempre al final)
    app.use('/api', rutaNoEncontrada);
    app.use(manejadorErrores);

    const PORT = process.env.PORT || 3000;

   conectarDB()
        .then(() => {
            app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
        })
        .catch((error) => {
            console.error('No se pudo conectar a Atlas:', error.message);
        });