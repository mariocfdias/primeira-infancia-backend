const cron = require('node-cron');
const fetchMunicipios = require('./fetchMunicipios');
const updateJsonMunicipio = require('./updateJsonMunicipio');
const autofetch = require('./autofetch');
const fetchEventos = require('./fetchEventos');
const fetchMissoes = require('./fetchMissoes');
const fetchMissaoDesempenho = require('./fetchMissaoDesempenho');

/**
 * Sets up all cron jobs for the application
 * @param {Object} connection - Database connection
 * @param {Object} config - Configuration object containing URLs for various jobs
 */
async function setupJobs(connection, config) {
    const {
        FETCH_MUNICIPIOS_URL,
        UPDATE_JSON_URL,
        FETCH_EVENTOS_URL,
        AUTOFETCH_URL,
        FETCH_MISSOES_URL,
        FETCH_MISSAO_DESEMPENHO_URL
    } = config;

    console.log('Setting up scheduled jobs...');

    // Run fetchMunicipios job every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        fetchMunicipios(connection, FETCH_MUNICIPIOS_URL);
    });

    // // Run autofetch job every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        autofetch(AUTOFETCH_URL);
    });

    // // // Run updateJsonMunicipio job every 5 minutes
    // // cron.schedule('*/5 * * * *', () => {
    // //     updateJsonMunicipio(connection, UPDATE_JSON_URL);
    // // });

    // // Run fetchEventos job every minute
    cron.schedule('* * * * *', () => {
        fetchEventos(connection, FETCH_EVENTOS_URL);
    });

    // Run fetchMissoes job every hour
    cron.schedule('0 * * * *', () => {
        fetchMissoes(connection, FETCH_MISSOES_URL);
    });

    // // Run fetchMissaoDesempenho job every hour
    cron.schedule('0 * * * *', () => {
        fetchMissaoDesempenho(connection, FETCH_MISSAO_DESEMPENHO_URL);
    });

    // Run the jobs immediately on startup
    await runJobsImmediately(connection, config).catch(err => {
        console.error('Error running startup jobs:', err);
    });
}

/**
 * Runs all jobs immediately upon server startup
 * @param {Object} connection - Database connection
 * @param {Object} config - Configuration object containing URLs for various jobs
 */
async function runJobsImmediately(connection, config) {
    console.log('Running jobs immediately on startup...');

    const {
        FETCH_MUNICIPIOS_URL,
        UPDATE_JSON_URL,
        FETCH_EVENTOS_URL,
        FETCH_MISSOES_URL,
        FETCH_MISSAO_DESEMPENHO_URL
    } = config;

    try {
        console.log('Starting sequential job execution...');

        // Execute jobs in sequence, waiting for each to complete
        await fetchMunicipios(connection, FETCH_MUNICIPIOS_URL);
        console.log('fetchMunicipios job completed');

        // Uncomment if needed
        // await updateJsonMunicipio(connection, UPDATE_JSON_URL);
        // console.log('updateJsonMunicipio job completed');

        await fetchMissoes(connection, FETCH_MISSOES_URL);
        console.log('fetchMissoes job completed');

        await fetchMissaoDesempenho(connection, FETCH_MISSAO_DESEMPENHO_URL);
        console.log('fetchMissaoDesempenho job completed');

        await fetchEventos(connection, FETCH_EVENTOS_URL);
        console.log('fetchEventos job completed');

        console.log('All startup jobs completed successfully');
    } catch (error) {
        console.error('Error during sequential job execution:', error);
    }
}

module.exports = { setupJobs };