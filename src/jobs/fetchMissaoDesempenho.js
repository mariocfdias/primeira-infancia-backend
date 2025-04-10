const fetch = require('node-fetch');
const MunicipioDesempenhoService = require('../service/MunicipioDesempenhoService');
const { MunicipioDesempenhoDTO } = require('../dto/MunicipioDesempenhoDTO');
const MissoesService = require('../service/MissoesService');
const MunicipioService = require('../service/MunicipioService');
const { ORG_IBGE_CODES } = require('../service/MunicipioDesempenhoSeed');

/**
 * Fetches the latest mission performance data from external API based on the most recent updated_at
 * @param {Object} connection - Database connection
 * @param {String} url - URL to fetch mission performance data from
 */
async function fetchMissaoDesempenho(connection, url) {
    console.log('Starting job: fetchMissaoDesempenho');

    const municipioDesempenhoService = new MunicipioDesempenhoService(connection);
    const missoesService = new MissoesService(connection);
    const municipioService = new MunicipioService(connection);
    const municipiosData = [
        {
            cod_ibge: "PREFEITURA",
            nome: "Prefeitura Municipal",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/13L40cl7VagIjuQtvStsH39omSGaLovvS/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "CAMARA",
            nome: "Câmara Municipal",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/13L40cl7VagIjuQtvStsH39omSGaLovvS/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "MPCE",
            nome: "Ministério Público do Estado do Ceará",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/13L40cl7VagIjuQtvStsH39omSGaLovvS/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "GOVCE",
            nome: "Governo do Estado do Ceará",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/1SPWjwDyovW7DskedzhH_iqSfZQrV1HzC/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "TCECE",
            nome: "TCE Ceará",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/1TN-m1leyK6sblCbGYG1G2kPoHq9awG4O/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "ASLEG",
            nome: "Assembleia Legislativa do Estado do Ceará",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/1MQGn3jZXFXdDd8aW8hzFNbaBB_20cr9N/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "DPCE",
            nome: "Defensoria Pública do Estado do Ceará",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/1nb0ySnGH1XB88mTjNv7hcT5t9dYPE_0L/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "MPCCE",
            nome: "Ministério Público de Contas do Estado do Ceará",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/14stBpGds6ApxoKbW1fZbOawfX5c8CJTo/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "MPTCE",
            nome: "Ministério Público do Trabalho no Ceará",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/1luurWfHIPVUHKAFGo1_YqPtm9aL06hEk/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "STE",
            nome: "Superintendência do Trabalho e Emprego",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/1kHSKT81smSQi0HRwTGCEz6IEQ4MQz1lA/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "TJCE",
            nome: "Tribunal de Justiça do Estado do Ceará",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/1-XJf5OKAoJ5DM6O-TJT3kSSpxambkao3/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
    ];

    try {
        // Get all missions from the database
        const missoes = await missoesService.findAll();
        console.log(`Found ${missoes.length} missions to process`);

        // Process each mission only for PREFEITURA and CAMARA
        for (const missao of missoes) {
            try {
                // Verificar se a missão é para PREFEITURA ou CAMARA
                if (!missao.id.includes("PREFEITURA") && !missao.id.includes("CAMARA")) {
                    console.log(`Skipping mission ${missao.id} as it's not for PREFEITURA or CAMARA`);
                    continue;
                }

                // Get the latest update date for this specific mission using TypeORM query
                const latestDate = await municipioDesempenhoService.getLatestUpdateDateByMissaoId(missao.id);
                const dateParam = latestDate.toISOString();
                console.log(`Fetching mission performance data for mission ${missao.id} newer than: ${dateParam}`);

                // Make the API request with the request type, date parameter, and missao parameter
                const fetchUrl = `${url}?request=missao_desempenho&date=${encodeURIComponent(dateParam)}&missao=${encodeURIComponent(missao.id)}&orgao=${missao.id.split("-")[0]}`;
                console.log(`Fetching from URL for mission ${missao.id}: ${fetchUrl}`);

                const response = await fetch(fetchUrl);
                const data = await response.json();

                if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
                    console.log(`Received ${data.data.length} performance records for mission ${missao.id}`);

                    // Process and save each performance record
                    for (const desempenhoData of data.data) {
                        try {
                            // Skip organizations that are in the ORG_IBGE_CODES list


                            // Check if a record with the same codIbge and missaoId already exists
                            const existingDesempenhos = await municipioDesempenhoService.findByIbgeCode(desempenhoData.codIbge);
                            const existingDesempenho = existingDesempenhos.find(d => d.missaoId === desempenhoData.missaoId);

                            desempenhoData.codIbge = `${missao.id.split("-")[0]}-${desempenhoData.codIbge}`
                            // Create a DTO from the received data
                            const desempenhoDTO = MunicipioDesempenhoDTO.builder()
                                .withCodIbge(desempenhoData.codIbge)
                                .withMissaoId(desempenhoData.missaoId)
                                .withValidationStatus(desempenhoData.validation_status || 'STARTED')
                                .withUpdatedAt(desempenhoData.updated_at || new Date())
                                .withEvidence(desempenhoData.evidence || [])
                                .build();

                            // If the record exists, update it; otherwise, create a new one
                            if (existingDesempenho) {
                                desempenhoDTO.id = existingDesempenho.id;
                                await municipioDesempenhoService.updateDesempenho(existingDesempenho.id, desempenhoDTO);
                                console.log(`Updated existing performance record for municipality ${desempenhoData.codIbge}, mission ${desempenhoData.missaoId}`);
                            } else {
                                await municipioDesempenhoService.createDesempenho(desempenhoDTO);
                                console.log(`Saved new performance record for municipality ${desempenhoData.codIbge}, mission ${desempenhoData.missaoId}`);
                            }

                            // Update municipality points and badges by recalculating from all completed missions
                            try {
                                // Get the municipality
                                const municipio = await municipioService.findByIdWithJson(desempenhoData.codIbge);
                                if (municipio) {
                                    // Get all completed missions for this municipality
                                    const allDesempenhos = await municipioDesempenhoService.findByIbgeCode(desempenhoData.codIbge);
                                    const completedDesempenhos = allDesempenhos.filter(d => d.validation_status === 'VALID');

                                    // Calculate total points and badges from completed missions
                                    let totalPoints = 0;
                                    const completedMissionIds = new Set();

                                    // For each completed mission, add its points
                                    for (const completedDesempenho of completedDesempenhos) {
                                        try {
                                            const mission = await missoesService.findById(completedDesempenho.missaoId);
                                            totalPoints += mission.qnt_pontos || 0;
                                            completedMissionIds.add(completedDesempenho.missaoId);
                                        } catch (missionError) {
                                            console.error(`Error fetching mission ${completedDesempenho.missaoId}:`, missionError.message);
                                        }
                                    }

                                    // Count unique badges (one badge per completed mission)
                                    const badgeCount = completedMissionIds.size;

                                    // Update municipality with calculated points and badges
                                    const updatedMunicipio = {
                                        ...municipio,
                                        points: totalPoints,
                                        badges: badgeCount
                                    };

                                    await municipioService.saveMunicipio(updatedMunicipio);
                                    console.log(`Updated municipality ${desempenhoData.codIbge} with recalculated points (${totalPoints}) and badges (${badgeCount})`);
                                } else {
                                    console.error(`Municipality ${desempenhoData.codIbge} not found, could not update points and badges`);
                                }
                            } catch (municipioError) {
                                console.error(`Error updating municipality ${desempenhoData.codIbge} points and badges:`, municipioError.message);
                            }
                        } catch (error) {
                            console.error(`Error processing performance record for municipality ${desempenhoData.codIbge}, mission ${desempenhoData.missaoId}:`, error.message);
                            console.error(error.stack);
                        }
                    }

                    console.log(`Successfully processed ${data.data.length} performance records for mission ${missao.id}`);
                } else {
                    console.log(`No performance data to process or invalid format received for mission ${missao.id}`);
                }
            } catch (missionError) {
                console.error(`Error processing mission ${missao.id}:`, missionError.message);
            }
        }

        // Process each organization in municipiosData
        for (const municipio of municipiosData) {
            try {
                // Skip PREFEITURA and CAMARA as they are processed differently
                if (municipio.cod_ibge === "PREFEITURA" || municipio.cod_ibge === "CAMARA") {
                    console.log(`Skipping ${municipio.cod_ibge} as it's processed differently`);
                    continue;
                }

                // Get the latest update date for this organization
                const latestDate = await municipioDesempenhoService.getLatestUpdateDateByOrgao(municipio.cod_ibge) || new Date(0);
                const dateParam = latestDate.toISOString();
                console.log(`Fetching performance data for organization ${municipio.cod_ibge} newer than: ${dateParam}`);

                // Use different URL format for organizations
                const fetchUrl = `${url}?request=missao_desempenho&orgao=${municipio.cod_ibge}`;
                console.log(`Fetching from URL for organization ${municipio.cod_ibge}: ${fetchUrl}`);

                const response = await fetch(fetchUrl);
                const data = await response.json();

                if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
                    console.log(`Received ${data.data.length} performance records for organization ${municipio.cod_ibge}`);

                    // Process and save each performance record
                    for (const desempenhoData of data.data) {
                        try {
                            // Check if a record with the same codIbge and missaoId already exists
                            const existingDesempenhos = await municipioDesempenhoService.findByIbgeCode(desempenhoData.codIbge);
                            const existingDesempenho = existingDesempenhos.find(d => d.missaoId === desempenhoData.missaoId);

                            // Create a DTO from the received data
                            const desempenhoDTO = MunicipioDesempenhoDTO.builder()
                                .withCodIbge(desempenhoData.codIbge)
                                .withMissaoId(desempenhoData.missaoId)
                                .withValidationStatus(desempenhoData.validation_status || 'STARTED')
                                .withUpdatedAt(desempenhoData.updated_at || new Date())
                                .withEvidence(desempenhoData.evidence || [])
                                .build();

                            // If the record exists, update it; otherwise, create a new one
                            if (existingDesempenho) {
                                desempenhoDTO.id = existingDesempenho.id;
                                await municipioDesempenhoService.updateDesempenho(existingDesempenho.id, desempenhoDTO);
                                console.log(`Updated existing performance record for organization ${desempenhoData.codIbge}, mission ${desempenhoData.missaoId}`);
                            } else {
                                console.log(desempenhoDTO)
                                await municipioDesempenhoService.createDesempenho(desempenhoDTO);
                                console.log(`Saved new performance record for organization ${desempenhoData.codIbge}, mission ${desempenhoData.missaoId}`);
                            }

                            // Update organization points and badges
                            try {
                                // Get the organization
                                const org = await municipioService.findByIdWithJson(desempenhoData.codIbge);
                                if (org) {
                                    // Get all completed missions for this organization
                                    const allDesempenhos = await municipioDesempenhoService.findByIbgeCode(desempenhoData.codIbge);
                                    const completedDesempenhos = allDesempenhos.filter(d => d.validation_status === 'VALID');

                                    // Calculate total points and badges from completed missions
                                    let totalPoints = 0;
                                    const completedMissionIds = new Set();

                                    // For each completed mission, add its points
                                    for (const completedDesempenho of completedDesempenhos) {
                                        try {
                                            const mission = await missoesService.findById(completedDesempenho.missaoId);
                                            totalPoints += mission.qnt_pontos || 0;
                                            completedMissionIds.add(completedDesempenho.missaoId);
                                        } catch (missionError) {
                                            console.error(`Error fetching mission ${completedDesempenho.missaoId}:`, missionError.message);
                                        }
                                    }

                                    // Count unique badges (one badge per completed mission)
                                    const badgeCount = completedMissionIds.size;

                                    // Update organization with calculated points and badges
                                    const updatedOrg = {
                                        ...org,
                                        points: totalPoints,
                                        badges: badgeCount
                                    };

                                    await municipioService.saveMunicipio(updatedOrg);
                                    console.log(`Updated organization ${desempenhoData.codIbge} with recalculated points (${totalPoints}) and badges (${badgeCount})`);
                                } else {
                                    console.error(`Organization ${desempenhoData.codIbge} not found, could not update points and badges`);
                                }
                            } catch (orgError) {
                                console.error(`Error updating organization ${desempenhoData.codIbge} points and badges:`, orgError.message);
                            }
                        } catch (error) {
                            console.error(`Error processing performance record for organization ${desempenhoData.codIbge}, mission ${desempenhoData.missaoId}:`, error.message);
                            console.error(error.stack);
                        }
                    }

                    console.log(`Successfully processed ${data.data.length} performance records for organization ${municipio.cod_ibge}`);
                } else {
                    console.log(`No performance data to process or invalid format received for organization ${municipio.cod_ibge}`);
                }
            } catch (orgError) {
                console.error(`Error processing organization ${municipio.cod_ibge}:`, orgError.message);
            }
        }
    } catch (error) {
        console.error('Error in fetchMissaoDesempenho job:', error.message);
    }

    console.log('Finished job: fetchMissaoDesempenho');
}

module.exports = fetchMissaoDesempenho;