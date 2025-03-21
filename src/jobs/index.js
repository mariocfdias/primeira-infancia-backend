const cron = require('node-cron');
const fetchMunicipios = require('./fetchMunicipios');
const updateJsonMunicipio = require('./updateJsonMunicipio');
const autofetch = require('./autofetch');
const fetchEventos = require('./fetchEventos');

/**
 * Sets up all cron jobs for the application
 * @param {Object} connection - Database connection
 * @param {Object} config - Configuration object containing URLs for various jobs
 */
function setupJobs(connection, config) {
    const {
        FETCH_MUNICIPIOS_URL,
        UPDATE_JSON_URL,
        FETCH_EVENTOS_URL,
        AUTOFETCH_URL
    } = config;

    console.log('Setting up scheduled jobs...');

    // Run fetchMunicipios job every 5 minutes
    // cron.schedule('*/5 * * * *', () => {
    //     fetchMunicipios(connection, FETCH_MUNICIPIOS_URL);
    // });

    // // Run autofetch job every 5 minutes
    // cron.schedule('*/5 * * * *', () => {
    //     autofetch(AUTOFETCH_URL);
    // });
    
    // // Run updateJsonMunicipio job every 5 minutes
    // cron.schedule('*/5 * * * *', () => {
    //     updateJsonMunicipio(connection, UPDATE_JSON_URL);
    // });
    
    // Run fetchEventos job every minute
    cron.schedule('* * * * *', () => {
        fetchEventos(connection, FETCH_EVENTOS_URL);
    });

    // Run the jobs immediately on startup
    runJobsImmediately(connection, config);
}

/**
 * Runs all jobs immediately upon server startup
 * @param {Object} connection - Database connection
 * @param {Object} config - Configuration object containing URLs for various jobs
 */
function runJobsImmediately(connection, config) {
    console.log('Running jobs immediately on startup...');
    
    const {
        FETCH_MUNICIPIOS_URL,
        UPDATE_JSON_URL,
        FETCH_EVENTOS_URL
    } = config;

    // fetchMunicipios(connection, FETCH_MUNICIPIOS_URL);
    // updateJsonMunicipio(connection, UPDATE_JSON_URL);
    fetchEventos(connection, FETCH_EVENTOS_URL);
}

module.exports = { setupJobs }; 