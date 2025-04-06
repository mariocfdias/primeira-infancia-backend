const MissoesRepository = require('../repository/MissoesRepository');
const MunicipioRepository = require('../repository/MunicipioRepository');
const MunicipioDesempenhoRepository = require('../repository/MunicipioDesempenhoRepository');
const { MissionPanoramaDTO, MapPanoramaDTO, DesempenhoPanoramaDTO } = require('../dto/DashboardDTO');
const { MissoesDTO } = require('../dto/MissoesDTO');
const { MunicipioDTO } = require('../dto/MunicipioDTO');

class DashboardService {
    constructor(connection) {
        this.missoesRepository = new MissoesRepository(connection);
        this.municipioRepository = new MunicipioRepository(connection);
        this.municipioDesempenhoRepository = new MunicipioDesempenhoRepository(connection);
        
        // Cache para o panorama do mapa
        this.mapPanoramaCache = {
            data: null,
            timestamp: null,
            ttl: 15 * 60 * 1000 // 15 minutos em milissegundos
        };
    }

    // Método para verificar se o cache é válido
    isMapPanoramaCacheValid() {
        if (!this.mapPanoramaCache.data || !this.mapPanoramaCache.timestamp) {
            return false;
        }
        
        const now = Date.now();
        return (now - this.mapPanoramaCache.timestamp) < this.mapPanoramaCache.ttl;
    }

    async getMissionPanoramaGeneral(orgao) {
        // Get all missions
        let missoes;
        if (orgao) {
            missoes = await this.missoesRepository.findAllByOrgao(orgao);
        } else {
            missoes = await this.missoesRepository.findAll();
        }
        
        // Get all municipios to count total
        let municipios = await this.municipioRepository.findAll();
        
        // Filter municipios by orgao if provided
        if (orgao) {
            municipios = municipios.filter(municipio => municipio.codIbge.includes(orgao));
        }
        
        const totalMunicipios = municipios.length;
        
        // Create mission panorama for each mission
        const missionPanorama = [];
        
        for (const missao of missoes) {
            // Get all desempenhos for this mission
            let desempenhos = await this.municipioDesempenhoRepository.findByMissaoId(missao.id);
            
            // Filter desempenhos by orgao if provided
            if (orgao) {
                desempenhos = desempenhos.filter(desempenho => desempenho.codIbge.includes(orgao));
            }
            
            // Count by status
            const countValid = desempenhos.filter(d => d.validation_status === 'VALID').length;
            const countPending = desempenhos.filter(d => d.validation_status === 'PENDING').length;
            const countStarted = desempenhos.filter(d => d.validation_status === 'STARTED').length;
            
            // Create panorama DTO
            const missionDTO = MissoesDTO.fromEntity(missao);
            
            const panoramaDTO = MissionPanoramaDTO.builder()
                .withMissao(missionDTO)
                .withCountValid(countValid)
                .withCountPending(countPending)
                .withCountStarted(countStarted)
                .withTotalMunicipios(totalMunicipios)
                .build();
            
            missionPanorama.push(panoramaDTO);
        }
        
        return missionPanorama;
    }

    async getMissionPanoramaById(missaoId) {
        // Get the specific mission
        const missao = await this.missoesRepository.findById(missaoId);
        if (!missao) {
            throw new Error('Missão não encontrada');
        }

        // Get all municipios to count total
        const municipios = await this.municipioRepository.findAll();
        const totalMunicipios = municipios.length;
        
        // Get all desempenhos for this mission
        const desempenhos = await this.municipioDesempenhoRepository.findByMissaoId(missaoId);
        
        // Count by status and filter desempenhos
        const validDesempenhos = desempenhos.filter(d => d.validation_status === 'VALID');
        const pendingDesempenhos = desempenhos.filter(d => d.validation_status === 'PENDING');
        
        // Separate pending desempenhos into started (with evidence) and just pending
        const startedDesempenhos = pendingDesempenhos.filter(d => {
            try {
                const evidence = JSON.parse(d.evidence);
                return Array.isArray(evidence) && evidence.length > 0;
            } catch (e) {
                return false;
            }
        });
        
        const justPendingDesempenhos = pendingDesempenhos.filter(d => {
            try {
                const evidence = JSON.parse(d.evidence);
                return !Array.isArray(evidence) || evidence.length === 0;
            } catch (e) {
                return true;
            }
        });

        const countValid = validDesempenhos.length;
        const countPending = justPendingDesempenhos.length;
        const countStarted = startedDesempenhos.length;
        
        // Get municipios that completed the mission
        const completedMunicipios = [];
        for (const desempenho of validDesempenhos) {
            const municipio = await this.municipioRepository.findOne(desempenho.codIbge);
            if (municipio) {
                completedMunicipios.push(MunicipioDTO.fromEntity(municipio));
            }
        }

        // Get municipios with pending status (no evidence)
        const pendingMunicipios = [];
        for (const desempenho of justPendingDesempenhos) {
            const municipio = await this.municipioRepository.findOne(desempenho.codIbge);
            if (municipio) {
                pendingMunicipios.push(MunicipioDTO.fromEntity(municipio));
            }
        }

        // Get municipios that started the mission (pending with evidence)
        const startedMunicipios = [];
        for (const desempenho of startedDesempenhos) {
            const municipio = await this.municipioRepository.findOne(desempenho.codIbge);
            if (municipio) {
                startedMunicipios.push(MunicipioDTO.fromEntity(municipio));
            }
        }
        
        // Create panorama DTO
        const missionDTO = MissoesDTO.fromEntity(missao);
        
        return MissionPanoramaDTO.builder()
            .withMissao(missionDTO)
            .withCountValid(countValid)
            .withCountPending(countPending)
            .withCountStarted(countStarted)
            .withTotalMunicipios(totalMunicipios)
            .withCompletedMunicipios(completedMunicipios)
            .withPendingMunicipios(pendingMunicipios)
            .withStartedMunicipios(startedMunicipios)
            .build();
    }

    // Método getMapPanorama modificado para usar cache e aceitar filtro de órgão
    async getMapPanorama(orgao) {
        // Se não tiver filtro de órgão e houver cache válido, retorne o cache
        if (!orgao && this.isMapPanoramaCacheValid()) {
            return this.mapPanoramaCache.data;
        }
        
        // Obter todos os municípios e missões em uma única consulta
        let municipios;
        let missoes;
        
        if (orgao) {
            [municipios, missoes] = await Promise.all([
                this.municipioRepository.findAll(),
                this.missoesRepository.findAllByOrgao(orgao)
            ]);
            // Ainda filtramos municipios pelo codIbge
            municipios = municipios.filter(municipio => municipio.codIbge.includes(orgao));
        } else {
            [municipios, missoes] = await Promise.all([
                this.municipioRepository.findAll(),
                this.missoesRepository.findAll()
            ]);
        }
        
        const totalMissoes = missoes.length;
        const totalMunicipios = municipios.length;
        
        // Obter todos os desempenhos de uma vez, em vez de consultar para cada município
        let allDesempenhos = await this.municipioDesempenhoRepository.findAllWithRelations();
        
        // Aplicar filtro de órgão nos desempenhos se fornecido
        if (orgao) {
            allDesempenhos = allDesempenhos.filter(desempenho => desempenho.codIbge.includes(orgao));
        }
        
        // Agrupar desempenhos por codIbge para acesso rápido
        const desempenhosByIbge = {};
        allDesempenhos.forEach(desempenho => {
            if (!desempenhosByIbge[desempenho.codIbge]) {
                desempenhosByIbge[desempenho.codIbge] = [];
            }
            desempenhosByIbge[desempenho.codIbge].push(desempenho);
        });
        
        // Inicializar arrays e contadores
        const mapPanorama = [];
        const municipioPoints = [];
        const pointsPerLevel = 100;
        
        // Contar prefeituras participantes
        const totalParticipatingPrefeituras = municipios.filter(m => m.status === 'Participante').length;
        
        // Contadores para porcentagem de missões concluídas
        let totalValidMissions = 0;
        let totalMissionEntries = 0;
        
        // Processar cada município
        for (const municipio of municipios) {
            const desempenhos = desempenhosByIbge[municipio.codIbge] || [];
            
            // Contar por status
            const countValid = desempenhos.filter(d => d.validation_status === 'VALID').length;
            const countPending = desempenhos.filter(d => d.validation_status === 'PENDING').length;
            const countStarted = desempenhos.filter(d => d.validation_status === 'STARTED').length;
            
            // Adicionar aos totais para cálculo de porcentagem
            totalValidMissions += countValid;
            totalMissionEntries += desempenhos.length;
            
            // Calcular pontos totais das missões válidas
            let totalPoints = 0;
            const validDesempenhos = desempenhos.filter(d => d.validation_status === 'VALID');
            
            for (const desempenho of validDesempenhos) {
                // Buscar a missão correspondente no array de missões
                const missao = missoes.find(m => m.id === desempenho.missaoId);
                if (missao && missao.qnt_pontos) {
                    totalPoints += missao.qnt_pontos;
                }
            }
            
            // Armazenar os pontos para cálculo posterior de desempenho
            municipioPoints.push(totalPoints);
            
            // Criar DTO do panorama
            const municipioDTO = MunicipioDTO.fromEntity(municipio);
            
            const panoramaDTO = MapPanoramaDTO.builder()
                .withMunicipio(municipioDTO)
                .withCountValid(countValid)
                .withCountPending(countPending)
                .withCountStarted(countStarted)
                .withTotalMissoes(totalMissoes)
                .withPoints(totalPoints)
                .build();
            
            mapPanorama.push(panoramaDTO);
        }
        
        // Calcular porcentagem de missões concluídas
        const percentageFinishedMissions = totalMissionEntries > 0 
            ? (totalValidMissions / totalMissionEntries) * 100 
            : 0;
        
        // Inicializar a distribuição de níveis
        const levelDistribution = [
            {
                level: 'NP',  // Não Participante
                minPoints: 0,
                maxPoints: 0,
                count: 0,
                municipios: []
            },
            {
                level: 0,     // Zero pontos
                minPoints: 0,
                maxPoints: 0,
                count: 0,
                municipios: []
            }
        ];

        // Adicionar níveis regulares
        const maxPoints = Math.max(...municipioPoints, 1);
        const numLevels = Math.ceil(maxPoints / pointsPerLevel);
        
        for (let i = 1; i <= numLevels; i++) {
            levelDistribution.push({
                level: i,
                minPoints: (i - 1) * pointsPerLevel + 1,  // Começa em 1, 101, 201, etc.
                maxPoints: i * pointsPerLevel - 1,        // Termina em 99, 199, 299, etc.
                count: 0,
                municipios: []
            });
        }
        
        // Adicionar um nível extra para os pontos que são múltiplos exatos de pointsPerLevel
        levelDistribution.push({
            level: numLevels + 1,
            minPoints: numLevels * pointsPerLevel,        // Começa em 300, 400, etc.
            maxPoints: (numLevels + 1) * pointsPerLevel - 1,  // Termina em 399, 499, etc.
            count: 0,
            municipios: []
        });

        // Distribuir os municípios nos níveis
        for (let i = 0; i < municipios.length; i++) {
            const municipio = municipios[i];
            const points = municipioPoints[i];

            // Verificar se é não participante
            if (municipio.status !== 'Participante') {
                levelDistribution[0].count++;
                levelDistribution[0].municipios.push(municipio.codIbge);
                continue;
            }

            // Grupo 0 (zero pontos)
            if (points === 0) {
                levelDistribution[1].count++;
                levelDistribution[1].municipios.push(municipio.codIbge);
                continue;
            }

            // Encontrar o nível apropriado para os pontos
            let levelIndex;
            
            // Se points é múltiplo exato de pointsPerLevel, coloca no próximo nível
            if (points % pointsPerLevel === 0) {
                levelIndex = (points / pointsPerLevel) + 2;
            } else {
                levelIndex = Math.floor((points - 1) / pointsPerLevel) + 2;
            }

            // Garantir que não exceda o array
            if (levelIndex < levelDistribution.length) {
                levelDistribution[levelIndex].count++;
                levelDistribution[levelIndex].municipios.push(municipio.codIbge);
            }
        }

        // Criar o panorama de desempenho
        const desempenhoPanorama = DesempenhoPanoramaDTO.builder()
            .withLevelDistribution(levelDistribution)
            .withTotalMunicipios(totalMunicipios)
            .build();
        
        // Armazenar resultado no cache apenas se não houver filtro de órgão
        if (!orgao) {
            this.mapPanoramaCache.data = {
                mapPanorama,
                desempenho: desempenhoPanorama,
                totalParticipatingPrefeituras,
                percentageFinishedMissions
            };
            this.mapPanoramaCache.timestamp = Date.now();
        }
        
        return {
            mapPanorama,
            desempenho: desempenhoPanorama,
            totalParticipatingPrefeituras,
            percentageFinishedMissions
        };
    }

    async getMapPanoramaByIbgeCode(codIbge) {
        // Verifica se o município existe
        const municipio = await this.municipioRepository.findOne(codIbge);
        if (!municipio) {
            throw new Error('Município não encontrado');
        }
        
        // Obtém todas as missões para contar o total
        const missoes = await this.missoesRepository.findAll();
        const totalMissoes = missoes.length;
        
        // Obtém todos os desempenhos para este município
        const desempenhos = await this.municipioDesempenhoRepository.findByIbgeCode(codIbge);
        
        // Conta por status
        const countValid = desempenhos.filter(d => d.validation_status === 'VALID').length;
        const countPending = desempenhos.filter(d => d.validation_status === 'PENDING').length;
        const countStarted = desempenhos.filter(d => d.validation_status === 'STARTED').length;
        
        // Calcula o total de pontos das missões válidas
        let totalPoints = 0;
        const validDesempenhos = desempenhos.filter(d => d.validation_status === 'VALID');
        
        for (const desempenho of validDesempenhos) {
            if (desempenho.missao && desempenho.missao.qnt_pontos) {
                totalPoints += desempenho.missao.qnt_pontos;
            }
        }
        
        // Cria o DTO do panorama com o objeto município e pontos
        const municipioDTO = MunicipioDTO.fromEntity(municipio);
        
        const panoramaDTO = MapPanoramaDTO.builder()
            .withMunicipio(municipioDTO)
            .withCountValid(countValid)
            .withCountPending(countPending)
            .withCountStarted(countStarted)
            .withTotalMissoes(totalMissoes)
            .withPoints(totalPoints)
            .build();
        
        // Determina o nível do município com base nos pontos
        const pointsPerLevel = 100;
        let level;
        
        // Verifica se é não participante
        if (municipio.status !== 'Participante') {
            level = 'NP';  // Não Participante
        } else if (totalPoints === 0) {
            level = 0;     // Zero pontos
        } else {
            // Se totalPoints é múltiplo exato de pointsPerLevel, coloca no próximo nível
            if (totalPoints % pointsPerLevel === 0) {
                level = totalPoints / pointsPerLevel;
            } else {
                level = Math.floor((totalPoints - 1) / pointsPerLevel) + 1;
            }
        }
        
        return {
            mapPanorama: panoramaDTO,
            level: level,
            totalPoints: totalPoints
        };
    }

    // Método para invalidar o cache quando necessário
    invalidateMapPanoramaCache() {
        this.mapPanoramaCache.data = null;
        this.mapPanoramaCache.timestamp = null;
    }
}

module.exports = DashboardService; 