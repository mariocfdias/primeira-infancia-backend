const MunicipioDesempenhoService = require('../service/MunicipioDesempenhoService');
const MissoesService = require('../service/MissoesService');
const MunicipioService = require('../service/MunicipioService');
const { MunicipioDesempenhoDTO } = require('../dto/MunicipioDesempenhoDTO');

// Mock data for special municipalities
const municipiosData = [
    {
        codIbge: "mpce",
        nome: "Ministério Público do Estado do Ceará",
        status: "Participante",
        dataAlteracao: new Date(0).toISOString(),
        imagemAvatar: "https://drive.google.com/file/d/13L40cl7VagIjuQtvStsH39omSGaLovvS/view?usp=sharing",
        badges: 0,
        points: 0,
        orgao: true
    },
    {
        codIbge: "govce",
        nome: "Governo do Estado do Ceará",
        status: "Participante",
        dataAlteracao: new Date(0).toISOString(),
        imagemAvatar: "https://drive.google.com/file/d/1SPWjwDyovW7DskedzhH_iqSfZQrV1HzC/view?usp=sharing",
        badges: 0,
        points: 0,
        orgao: true
    },
    {
        codIbge: "tcece",
        nome: "TCE Ceará",
        status: "Participante",
        dataAlteracao: new Date(0).toISOString(),
        imagemAvatar: "https://drive.google.com/file/d/1TN-m1leyK6sblCbGYG1G2kPoHq9awG4O/view?usp=sharing",
        badges: 0,
        points: 0,
        orgao: true
    },
    {
        codIbge: "podleg",
        nome: "Poder Legislativo do Estado do Ceará",
        status: "Participante",
        dataAlteracao: new Date(0).toISOString(),
        imagemAvatar: "https://drive.google.com/file/d/1MQGn3jZXFXdDd8aW8hzFNbaBB_20cr9N/view?usp=sharing",
        badges: 0,
        points: 0,
        orgao: true
    },
];

async function seedMunicipioDesempenho(connection) {
    console.log('Starting seed: municipio_desempenho');
    const municipioDesempenhoService = new MunicipioDesempenhoService(connection);
    const missoesService = new MissoesService(connection);
    const municipioService = new MunicipioService(connection);
    
    try {
        // Get all municipalities from the database
        const dbMunicipios = await municipioService.findAll();
        
        // Combine database municipalities with mock data
        const municipios = [...dbMunicipios, ...municipiosData];
        console.log(`Found ${municipios.length} municipalities to seed (${dbMunicipios.length} from DB + ${municipiosData.length} mocks)`);
        
        if (municipios.length === 0) {
            console.log('No municipalities found. Skipping seed.');
            return;
        }

        // Get all missions
        const missoes = await missoesService.findAll();
        console.log(`Found ${missoes.length} missions to use for seeding`);
        
        if (missoes.length === 0) {
            console.log('No missions found in database. Skipping seed.');
            return;
        }

        // Filter out orgaos from the selection pool for fully completed municipalities
        const regularMunicipios = municipios.filter(m => !m.orgao);
        console.log(`Found ${regularMunicipios.length} regular municipalities (excluding orgaos) for selection`);

        // Select 6 random municipalities to have all missions completed
        const numFullyCompleted = Math.min(6, regularMunicipios.length);
        const shuffledRegularMunicipios = [...regularMunicipios].sort(() => Math.random() - 0.5);
        const fullyCompletedMunicipios = shuffledRegularMunicipios.slice(0, numFullyCompleted);
        
        // Get remaining municipalities (both regular and orgaos that weren't selected)
        const remainingMunicipios = municipios.filter(m => 
            !fullyCompletedMunicipios.some(fcm => fcm.codIbge === m.codIbge)
        );

        console.log(`Selected ${fullyCompletedMunicipios.length} regular municipalities for full completion`);
        console.log('Fully completed municipalities:', fullyCompletedMunicipios.map(m => m.codIbge).join(', '));

        // Verify and reset each municipality
        for (const municipio of municipios) {
            try {
                // Delete all existing desempenhos for this municipality
                await municipioDesempenhoService.deleteByIbgeCode(municipio.codIbge);
                console.log(`Deleted existing desempenhos for municipality ${municipio.codIbge}`);
                
                // Reset badges and points
                const resetMunicipio = {
                    ...municipio,
                    badges: 0,
                    points: 0
                };
                await municipioService.saveMunicipio(resetMunicipio);
                console.log(`Reset badges and points for municipality ${municipio.codIbge}`);
            } catch (error) {
                console.error(`Error resetting municipality ${municipio.codIbge}:`, error.message);
                continue;
            }
        }

        // Create desempenho records
        const createdRecords = [];
        
        // First, create VALID desempenhos for the fully completed municipalities
        console.log(`Creating VALID desempenhos for ${numFullyCompleted} fully completed municipalities`);
        for (const municipio of fullyCompletedMunicipios) {
            for (const missao of missoes) {
                try {
                    // Create evidence array based on missao.evidencias
                    let evidence = [];
                    if (missao.evidencias && Array.isArray(missao.evidencias)) {
                        evidence = missao.evidencias.map((_, index) => ({
                            evidencia: `https://drive.google.com/open?id=${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
                            title: `Evidência ${index + 1}`
                        }));
                    }
                    
                    // Calculate date in the past (0-30 days ago)
                    const daysAgo = Math.floor(Math.random() * 30);
                    const updatedAt = new Date();
                    updatedAt.setDate(updatedAt.getDate() - daysAgo);
                    
                    // Create DTO with VALID status
                    const desempenhoDTO = MunicipioDesempenhoDTO.builder()
                        .withCodIbge(municipio.codIbge)
                        .withMissaoId(missao.id)
                        .withValidationStatus('VALID')
                        .withUpdatedAt(updatedAt)
                        .withEvidence(evidence)
                        .build();
                    
                    // Save to database
                    const savedDesempenho = await municipioDesempenhoService.createDesempenho(desempenhoDTO);
                    createdRecords.push(savedDesempenho);
                    
                    console.log(`Created VALID desempenho for fully completed municipality ${municipio.codIbge}, mission ${missao.id}`);
                } catch (error) {
                    console.error(`Error creating desempenho for municipality ${municipio.codIbge}, mission ${missao.id}:`, error.message);
                }
            }
        }
        
        // Then create random status desempenhos for the remaining municipalities
        console.log(`Creating random status desempenhos for ${remainingMunicipios.length} remaining municipalities`);
        for (const municipio of remainingMunicipios) {
            for (const missao of missoes) {
                try {
                    // Create desempenho with random status (mostly VALID for demo purposes)
                    const random = Math.random();
                    let status;
                    if (random < 0.08) {
                        status = 'VALID';
                    } else if (random < 0.9) {
                        status = 'PENDING';
                    } else {
                        status = 'STARTED';
                    }
                    
                    // Create evidence array based on missao.evidencias if it exists
                    let evidence = [];
                    if (missao.evidencias && Array.isArray(missao.evidencias)) {
                        evidence = missao.evidencias
                            .map((_, index) => {
                                // 40% chance of having evidence
                                const hasEvidence = Math.random() < 0.4;
                                if (!hasEvidence) return null;
                                
                                return {
                                    evidencia: `https://drive.google.com/open?id=${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
                                    title: `Evidência ${index + 1}`
                                };
                            })
                            .filter(item => item !== null);
                    }
                    
                    // Calculate date in the past (0-30 days ago)
                    const daysAgo = Math.floor(Math.random() * 30);
                    const updatedAt = new Date();
                    updatedAt.setDate(updatedAt.getDate() - daysAgo);
                    
                    // Create DTO
                    const desempenhoDTO = MunicipioDesempenhoDTO.builder()
                        .withCodIbge(municipio.codIbge)
                        .withMissaoId(missao.id)
                        .withValidationStatus(status)
                        .withUpdatedAt(updatedAt)
                        .withEvidence(evidence)
                        .build();
                    
                    // Save to database
                    const savedDesempenho = await municipioDesempenhoService.createDesempenho(desempenhoDTO);
                    createdRecords.push(savedDesempenho);
                    
                    console.log(`Created desempenho for municipality ${municipio.codIbge}, mission ${missao.id} with status ${status}`);
                } catch (error) {
                    console.error(`Error creating desempenho for municipality ${municipio.codIbge}, mission ${missao.id}:`, error.message);
                }
            }
        }
        
        console.log(`Successfully created ${createdRecords.length} desempenho records`);
        
        // Update municipality points and badges
        for (const municipio of municipios) {
            try {
                // Get all completed missions for this municipality
                const desempenhos = await municipioDesempenhoService.findByIbgeCode(municipio.codIbge);
                const completedDesempenhos = desempenhos.filter(d => d.validation_status === 'VALID');
                
                // Check if this is one of the fully completed municipalities
                const isFullyCompleted = fullyCompletedMunicipios.some(fcm => fcm.codIbge === municipio.codIbge);
                
                let totalPoints = 0;
                const completedMissionIds = new Set();

                // For fully completed municipalities, set fixed points
                if (isFullyCompleted) {
                    totalPoints = 200;
                    // Add all mission IDs to completed set for badge count
                    for (const missao of missoes) {
                        completedMissionIds.add(missao.id);
                    }
                } else {
                    // For each completed mission, add its points
                    for (const desempenho of completedDesempenhos) {
                        try {
                            const mission = await missoesService.findById(desempenho.missaoId);
                            if (mission) {
                                totalPoints += mission.qnt_pontos || 0;
                                completedMissionIds.add(desempenho.missaoId);
                                console.log(`Added ${mission.qnt_pontos || 0} points from mission ${desempenho.missaoId} for municipality ${municipio.codIbge}`);
                            }
                        } catch (missionError) {
                            console.error(`Error fetching mission ${desempenho.missaoId}:`, missionError.message);
                        }
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
                console.log(`Updated municipality ${municipio.codIbge} - Status: ${isFullyCompleted ? 'Fully Completed' : 'Regular'} - Points: ${totalPoints} - Badges: ${badgeCount}`);
            } catch (error) {
                console.error(`Error updating municipality ${municipio.codIbge} points and badges:`, error.message);
            }
        }

        // Update status to "Participante" for municipalities with completed missions
        console.log('Updating status for municipalities with completed missions...');
        for (const municipio of municipios) {
            try {
                const desempenhos = await municipioDesempenhoService.findByIbgeCode(municipio.codIbge);
                const hasCompletedMissions = desempenhos.some(d => d.validation_status === 'VALID');
                
                if (hasCompletedMissions) {
                    const updatedMunicipio = {
                        ...municipio,
                        status: "Participante"
                    };
                    await municipioService.saveMunicipio(updatedMunicipio);
                    console.log(`Updated municipality ${municipio.codIbge} status to Participante`);
                }
            } catch (error) {
                console.error(`Error updating status for municipality ${municipio.codIbge}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error in municipio_desempenho seed:', error.message);
    }
    
    console.log('Finished seed: municipio_desempenho');
}

module.exports = {
    seedMunicipioDesempenho
}; 