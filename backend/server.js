////////////////

    require('dotenv').config();
    const express = require('express');
    const morgan = require('morgan');
    const conectarDB = require('./config/db');
    const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/errorHandler');

    const app = express();
    app.use(morgan('dev'));
    app.use(express.json());

    // Ruta de prueba
    app.get('/api/salud', (req, res) => res.status(200).json({ estado: 'ok' }));

    // Errores (siempre al final)
    app.use('/api', rutaNoEncontrada);
    app.use(manejadorErrores);

    const PORT = process.env.PORT || 3000;

    conectarDB()
        .then(() => app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`)))
        .catch((error) => {
        console.error('No se pudo conectar a Atlas:', error.message);
        process.exit(1);
    });