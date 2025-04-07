const fetch = require('node-fetch');
const MunicipioService = require('../service/MunicipioService');

async function fetchMunicipios(connection, url) {
    console.log('Starting job: fetchMunicipios');
    
    const municipioService = new MunicipioService(connection);
    
    try {
        // Get the biggest dataAlteracao using the repository
        const biggestDate = await municipioService.municipioRepository.getMaxDataAlteracao();
        console.log(`Latest dataAlteracao found: ${biggestDate}`);
        
        // Format URL with date parameter
        const orgaos = ['CAMARA', 'PREFEITURA'];
        for (const orgao of orgaos) {
            const fetchUrl = `${url}?request=participantes&orgao=${orgao}`;
            console.log(`Fetching from URL: ${fetchUrl}`);
            
        const response = await fetch(fetchUrl);
        const data = await response.json();

        if (data.status === 'success' && Array.isArray(data.data)) {
            const promises = [];

            data.data.forEach(municipioData => {
                const camaraData = {...municipioData};

                console.log({municipioData});
                
                // Create a copy of the data for CAMARA
                camaraData.codIbge = `${orgao}-${municipioData.codIbge || municipioData.cod_ibge}`;

                // Save both records
                promises.push(municipioService.saveMunicipio(camaraData));
            });
            
            await Promise.all(promises);
            console.log(`Successfully processed ${promises.length} records for ${data.data.length} municipios (2 records each)`);
        } else {
                throw new Error('Invalid data format received');
            }
        }
    } catch (error) {
        console.error('Error in fetchMunicipios job:', error.message);
    }
    
    console.log('Finished job: fetchMunicipios');
}

module.exports = fetchMunicipios;
