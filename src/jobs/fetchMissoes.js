const fetch = require('node-fetch');
const MissoesService = require('../service/MissoesService');
const { MissoesDTO } = require('../dto/MissoesDTO');
const MunicipioSeed = require('../service/MunicipioSeed');

/**
 * Fetches the latest missions data from external API and updates the database
 * @param {Object} connection - Database connection
 * @param {String} url - URL to fetch missions from
 * @param {Object} extraParams - Additional parameters to include in the request
 */
async function fetchMissoes(connection, url, extraParams = {}) {
    console.log('Starting job: fetchMissoes');
    
    const missoesService = new MissoesService(connection);
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
            imagem_avatar: "https://drive.google.com/file/d/1MQGn3jZXFXdDd8aW8hzFNbaBB_20cr9N/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "MPCCE",
            nome: "Ministério Público de Contas do Estado do Ceará",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/1MQGn3jZXFXdDd8aW8hzFNbaBB_20cr9N/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "MPTCE",
            nome: "Ministério Público do Trabalho no Ceará",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/1MQGn3jZXFXdDd8aW8hzFNbaBB_20cr9N/view?usp=sharing",
            badges: 0,
            points: 0,
            orgao: true
        },
        {
            cod_ibge: "STE",
            nome: "Superintendência do Trabalho e Emprego",
            status: "Participante",
            data_alteracao: new Date(0).toISOString(),
            imagem_avatar: "https://drive.google.com/file/d/1MQGn3jZXFXdDd8aW8hzFNbaBB_20cr9N/view?usp=sharing",
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

    // Verificar se municipiosData é um array válido
    if (!Array.isArray(municipiosData) || municipiosData.length === 0) {
        console.error('Erro: municipiosData não é um array válido ou está vazio');
        console.log('Finalizando job: fetchMissoes');
        return;
    }
    
    // Array para armazenar as missões que falharam
    const falhasMissoes = [];
    
    try {
        // Process each municipality
        for (const municipio of municipiosData) {
            try {
                // Construct URL with the request parameter and municipality code
                let fetchUrl = `${url}?request=documentacao_missoes&orgao=${municipio.cod_ibge}`;
                console.log(`Buscando missões para ${municipio.nome}: ${fetchUrl}`);
                
                const response = await fetch(fetchUrl);
                const data = await response.json();
                
                if (data.status === 'success' && Array.isArray(data.data)) {
                    console.log(`Recebidas ${data.data.length} missões para processar para ${municipio.nome}`);
                    
                    // Process and save each mission
                    for (const missaoData of data.data) {
                        try {
                            // Check if mission already exists
                            let existingMissao;
                            try {
                                existingMissao = await missoesService.findById(missaoData.id);
                            } catch (error) {
                                // Mission doesn't exist yet
                                existingMissao = null;
                            }
                            
                            console.log({missaoData});
                            // Create a DTO from the received data
                            const missaoDTO = MissoesDTO.builder()
                                .withId(missaoData.id)
                                .withCategoria(missaoData.categoria)
                                .withDescricaoCategoria(missaoData.descricao_da_categoria)
                                .withEmblemaCategoria(missaoData.emblema_da_categoria)
                                .withDescricaoMissao(missaoData.descricao_da_missao)
                                .withQuantidadePontos(missaoData.qnt_pontos)
                                .withLinkFormulario(missaoData.link_formulario)
                                .withEvidencias(missaoData.evidencias || [])
                                .build();
                            
                            // Save or update the mission in the database
                            if (existingMissao) {
                                await missoesService.updateMissao(missaoData.id, missaoDTO);
                                console.log(`Atualizada missão existente: ${missaoData.id} para ${municipio.nome}`);
                            } else {
                                await missoesService.createMissao(missaoDTO);
                                console.log(`Salva nova missão: ${missaoData.id} para ${municipio.nome}`);
                            }
                        } catch (missionError) {
                            console.error(`Erro ao processar missão ${missaoData.id} para ${municipio.nome}:`, missionError.message);
                            // Registrar a missão que falhou
                            falhasMissoes.push({
                                id: missaoData.id,
                                municipio: municipio.nome,
                                erro: missionError.message,
                                url: fetchUrl
                            });
                        }
                    }
                    
                    console.log(`Processadas com sucesso ${data.data.length} missões para ${municipio.nome}`);
                } else {
                    console.log(`Nenhuma missão para processar ou formato inválido recebido para ${municipio.nome}`);
                }
            } catch (municipioError) {
                console.error(`Erro ao processar município ${municipio.nome}:`, municipioError.message);
                // Continue with the next municipality
            }
        }
    } catch (error) {
        console.error('Erro no job fetchMissoes:', error.message);
    }
    
    // Exibir resumo das missões que falharam
    if (falhasMissoes.length > 0) {
        console.log('=== RESUMO DE MISSÕES COM FALHA ===');
        console.log(`Total de missões com falha: ${falhasMissoes.length}`);
        falhasMissoes.forEach((falha, index) => {
            console.log(`${index + 1}. Missão ID: ${falha.id} | Município: ${falha.municipio} | URL: ${falha.url} | Erro: ${falha.erro}`);
        });
        console.log('===================================');
    } else {
        console.log('Todas as missões foram processadas com sucesso!');
    }
    
    console.log('Finalizado job: fetchMissoes');
}

module.exports = fetchMissoes; 