const MunicipioDesempenhoService = require('../service/MunicipioDesempenhoService');
const MissoesRepository = require('../repository/MissoesRepository');
const MunicipioService = require('../service/MunicipioService');
const { MunicipioDesempenhoDTO } = require('../dto/MunicipioDesempenhoDTO');

// Orgaos data (excluding PREFEITURA and CAMARA)
const orgaosData = [
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
async function seedOrgaosDesempenho(connection) {
    console.log('Starting seed: orgaos_desempenho');
    const municipioDesempenhoService = new MunicipioDesempenhoService(connection);
    const missoesRepository = new MissoesRepository(connection);
    const municipioService = new MunicipioService(connection);

    try {
        // Process each orgao
        for (const orgao of orgaosData) {
            console.log(`Processing orgao: ${orgao.cod_ibge} - ${orgao.nome}`);

            try {
                // Delete all existing desempenhos for this orgao
                await municipioDesempenhoService.deleteByIbgeCode(orgao.cod_ibge);
                console.log(`Deleted existing desempenhos for orgao ${orgao.cod_ibge}`);

                // Reset badges and points
                const resetOrgao = {
                    ...orgao,
                    badges: 0,
                    points: 0
                };
                await municipioService.saveMunicipio(resetOrgao);
                console.log(`Reset badges and points for orgao ${orgao.cod_ibge}`);

                // Find all missions for this orgao using the findAllByCode method
                const missoes = await missoesRepository.findAllByCode(orgao.cod_ibge);
                console.log(`Found ${missoes.length} missions for orgao ${orgao.cod_ibge}`);

                if (missoes.length === 0) {
                    console.log(`No missions found for orgao ${orgao.cod_ibge}. Skipping.`);
                    continue;
                }

                // Create desempenho records with VALID status for all missions
                let totalPoints = 0;
                let badgeCount = 0;

                for (const missao of missoes) {
                    try {
                        // Create DTO with VALID status and empty evidence array
                        const desempenhoDTO = MunicipioDesempenhoDTO.builder()
                            .withCodIbge(orgao.cod_ibge)
                            .withMissaoId(missao.id)
                            .withValidationStatus('PENDING')
                            .withUpdatedAt(new Date())
                            .withEvidence([])
                            .build();

                        // Save to database
                        const savedDesempenho = await municipioDesempenhoService.createDesempenho(desempenhoDTO);
                        console.log(`Created VALID desempenho for orgao ${orgao.cod_ibge}, mission ${missao.id}`);

                        // Add points from mission
                        totalPoints += missao.qnt_pontos || 0;
                        badgeCount++;
                    } catch (error) {
                        console.error(`Error creating desempenho for orgao ${orgao.cod_ibge}, mission ${missao.id}:`, error.message);
                    }
                }

                // Update orgao with calculated points and badges
                const updatedOrgao = {
                    ...orgao,
                    points: totalPoints,
                    badges: badgeCount,
                    status: "Participante"
                };

                await municipioService.saveMunicipio(updatedOrgao);
                console.log(`Updated orgao ${orgao.cod_ibge} - Points: ${totalPoints} - Badges: ${badgeCount}`);

            } catch (error) {
                console.error(`Error processing orgao ${orgao.cod_ibge}:`, error.message);
            }
        }

        console.log('Finished processing all orgaos');

    } catch (error) {
        console.error('Error in orgaos_desempenho seed:', error.message);
    }

    console.log('Finished seed: orgaos_desempenho');
}

module.exports = {
    seedOrgaosDesempenho
};