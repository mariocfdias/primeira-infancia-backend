const MunicipioService = require('../service/MunicipioService');

async function seedMunicipios(connection) {
    console.log('Starting seed: municipios');
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
        // Verificar se já existem os municipios específicos no banco
        const results = [];
        console.log({municipiosData});
        for (const municipioData of municipiosData) {
            if(municipioData.cod_ibge == "PREFEITURA" || municipioData.cod_ibge == "CAMARA") {
                continue;
            }
            const existingMunicipio = await municipioService.findById(municipioData.cod_ibge);
            
            if (existingMunicipio == null) {
                console.log(`Adding municipio: ${municipioData.nome}`);
                // Se o município não existir, adiciona-o
                const savedMunicipio = await municipioService.saveMunicipio(municipioData);
                results.push(savedMunicipio);
                console.log(`Added municipio: ${municipioData.nome}`);
            } else {
                console.log(`Skipped: ${municipioData.nome} already exists`);
            }
        }
        
        console.log(`Seed completed: ${results.length} new municipios added`);
    } catch (error) {
        console.error('Error in municipios seed:', error.message);
    }
    
    console.log('Finished seed: municipios');
}

module.exports = seedMunicipios;