const express = require('express');
const { connectDB } = require('./db');
const { setupRoutes } = require('./routes');
const { setupSwagger } = require('./swagger');
const { setupJobs } = require('./jobs');
const seedMunicipios = require('./service/MunicipioSeed');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3001;

// Job configuration
const SCRIPT_URL = process.env.SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbx0vtDoD-B0vq4vNlpPkQ69e8scixftZfqTFzAMmMFRQX4tqux9fIvKlNdcDKDrfwuM/exec';
const jobConfig = {
    FETCH_MUNICIPIOS_URL: SCRIPT_URL,
    UPDATE_JSON_URL: SCRIPT_URL,
    FETCH_EVENTOS_URL: SCRIPT_URL,
    AUTOFETCH_URL: process.env.AUTOFETCH_URL || 'https://primeira-infancia-backend.onrender.com/api/municipios',
    FETCH_MISSOES_URL: SCRIPT_URL,
    FETCH_MISSAO_DESEMPENHO_URL: process.env.FETCH_MISSAO_DESEMPENHO_URL || 'https://script.google.com/macros/s/AKfycbxcTV4SrjXBnYOaTr47bFmYTbHyePKB-BdR6fddMXdZVMnsM9Qy_E8knZEIsMgjdZHJ/exec'
};

app.use(express.json());

async function startServer() {
    try {
        const connection = await connectDB();
        app.use(require('cors')());

        await seedMunicipios(connection);
        
        // Raw JSON endpoint (before Swagger setup to avoid middleware conflict)
        app.get('/raw-swagger.json', (req, res) => {
            // Get swagger options from the swagger.js file
            const options = require('./swagger').options;
            // Generate the specifications
            const specs = swaggerJsdoc(options);
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(JSON.stringify(specs, null, 4));
        });
        
        // Setup Swagger documentation
        setupSwagger(app);
        
        // Setup routes
        app.use('/api', setupRoutes(connection));
        
        // Setup scheduled jobs
        setupJobs(connection, jobConfig);
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
            console.log(`Raw Swagger JSON available at http://localhost:${PORT}/raw-swagger.json`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();