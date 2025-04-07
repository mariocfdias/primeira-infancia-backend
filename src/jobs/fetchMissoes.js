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
                // Add debug info for the response
                console.log(`Response status: ${response.status} ${response.statusText}`);

                try {
                    const data = await response.json();
                    console.log(`Response data type: ${typeof data}`);

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

                                // Enhanced debugging: log the missao data with more detail
                                console.log('Processing mission data:');
                                console.log('Mission ID:', missaoData.id);
                                console.log('Raw missaoData:', JSON.stringify(missaoData, null, 2));

                                // Create a DTO from the received data
                                try {
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
                                } catch (dtoError) {
                                    console.error(`Erro ao criar DTO para missão ${missaoData.id}:`, dtoError.message);
                                    console.error('DTO Error stack:', dtoError.stack);

                                    // Check each field for potential issues
                                    console.error('Problematic fields check:');
                                    const fields = [
                                        'id', 'categoria', 'descricao_da_categoria', 'emblema_da_categoria',
                                        'descricao_da_missao', 'qnt_pontos', 'link_formulario', 'evidencias'
                                    ];

                                    for (const field of fields) {
                                        console.error(`${field}:`, typeof missaoData[field], missaoData[field]);
                                    }

                                    throw dtoError; // Re-throw to be caught by outer catch block
                                }
                            } catch (missionError) {
                                console.error(`Erro ao processar missão ${missaoData.id} para ${municipio.nome}:`, missionError.message);
                                console.error('Error details:', missionError);
                                console.error('Data that caused the error:');
                                try {
                                    console.error(JSON.stringify(missaoData, null, 2));
                                } catch (jsonError) {
                                    console.error('Could not stringify missaoData:', jsonError.message);
                                    console.error('missaoData keys:', Object.keys(missaoData));
                                    // Log each property individually to find problematic ones
                                    for (const key in missaoData) {
                                        try {
                                            console.error(`${key}:`, JSON.stringify(missaoData[key]));
                                        } catch (e) {
                                            console.error(`${key}: [Cannot stringify - ${e.message}]`);
                                        }
                                    }
                                }
                                // Registrar a missão que falhou
                                const errorType = missionError.name === 'QueryFailedError' ||
                                                 missionError.name === 'EntityNotFoundError' ||
                                                 missionError.message.includes('SQLite') ||
                                                 missionError.message.includes('typeorm') ?
                                                 'Database Error' : 'Processing Error';

                                falhasMissoes.push({
                                    id: missaoData.id || 'ID desconhecido',
                                    municipio: municipio.nome,
                                    erro: missionError.message,
                                    tipo_erro: errorType,
                                    url: fetchUrl
                                });
                            }
                        }

                        console.log(`Processadas com sucesso ${data.data.length} missões para ${municipio.nome}`);
                    } else {
                        console.log(`Nenhuma missão para processar ou formato inválido recebido para ${municipio.nome}`);
                    }
                } catch (dataError) {
                    console.error(`Erro ao processar dados recebidos para ${municipio.nome}:`, dataError.message);
                    // Continue with the next municipality
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

        // Agrupar falhas por tipo de erro
        const errosPorTipo = {};
        falhasMissoes.forEach(falha => {
            if (!errosPorTipo[falha.tipo_erro]) {
                errosPorTipo[falha.tipo_erro] = 0;
            }
            errosPorTipo[falha.tipo_erro]++;
        });

        // Mostrar resumo por tipo de erro
        console.log('Resumo por tipo de erro:');
        for (const tipo in errosPorTipo) {
            console.log(`- ${tipo}: ${errosPorTipo[tipo]}`);
        }

        // Detalhes de cada falha
        falhasMissoes.forEach((falha, index) => {
            console.log(`${index + 1}. Missão ID: ${falha.id} | Município: ${falha.municipio} | Tipo: ${falha.tipo_erro} | Erro: ${falha.erro}`);
        });
        console.log('===================================');
    } else {
        console.log('Todas as missões foram processadas com sucesso!');
    }

    console.log('Finalizado job: fetchMissoes');
}

module.exports = fetchMissoes;