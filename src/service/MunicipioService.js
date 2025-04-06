const fetch = require('node-fetch');
const MunicipioRepository = require('../repository/MunicipioRepository');

class MunicipioService {
    constructor(connection) {
        this.municipioRepository = new MunicipioRepository(connection);
    }

    async findAll(orgao) {
        return await this.municipioRepository.findAll(orgao);
    }

    async findById(codIbge) {
        const municipio = await this.municipioRepository.findOne(codIbge.toUpperCase());
        if (!municipio) {
            return null;
        }
        return municipio;
    }

    async findParticipantes(orgao) {
        return await this.municipioRepository.findParticipantes(orgao);
    }

    async findByIdWithJson(codIbge) {
        return await this.municipioRepository.findByIdWithJson(codIbge.toUpperCase());
    }

    async findMunicipioCompleto(codIbge) {
        const municipio = await this.municipioRepository.findByIdWithDesempenhoEMissoes(codIbge.toUpperCase());
        
        if (!municipio) {
            return null;
        }
        
        return municipio;
    }

    async searchByName(search, limit = 10, orgao) {
        return await this.municipioRepository.searchByName(search, limit, orgao);
    }

    async saveMunicipio(municipioData) {
        const municipio = {
            codIbge: ((municipioData.codIbge || municipioData.cod_ibge).toString()).toUpperCase(),
            nome: municipioData.nome,
            status: municipioData.status,
            dataAlteracao: municipioData.dataAlteracao || municipioData.data_alteracao || null,
            imagemAvatar: municipioData.imagemAvatar || municipioData.imagem_avatar || null,
            badges: municipioData.badges || 0,
            points: municipioData.points || 0,
            orgao: municipioData.orgao || false
        };
        console.log({municipio});
        return await this.municipioRepository.save(municipio);
    }

    async updateMunicipioJson(codIbge, jsonData) {
        const municipio = await this.municipioRepository.findByIdWithJson(codIbge.toUpperCase());
        if (!municipio) {
            throw new Error(`Municipio with codIbge ${codIbge.toUpperCase()} not found`);
        }
        municipio.json = JSON.stringify(jsonData);
        return await this.municipioRepository.save(municipio);
    }
}

module.exports = MunicipioService;
