const fetch = require('node-fetch');
const MunicipioRepository = require('../repository/MunicipioRepository');

class MunicipioService {
    constructor(connection) {
        this.municipioRepository = new MunicipioRepository(connection);
    }

    async findAll() {
        return await this.municipioRepository.findAll();
    }

    
    async findParticipantes() {
        return await this.municipioRepository.findParticipantes();
    }

    async findByIdWithJson(codIbge) {
        return await this.municipioRepository.findByIdWithJson(codIbge);
    }

    async findMunicipioCompleto(codIbge) {
        const municipio = await this.municipioRepository.findByIdWithDesempenhoEMissoes(codIbge);
        
        if (!municipio) {
            return null;
        }
        
        return municipio;
    }

    async searchByName(search, limit = 10) {
        return await this.municipioRepository.searchByName(search, limit);
    }

    async saveMunicipio(municipioData) {
        const municipio = {
            codIbge: municipioData.codIbge.toString(),
            nome: municipioData.nome,
            status: municipioData.status,
            dataAlteracao: municipioData.dataAlteracao || null,
            imagemAvatar: municipioData.imagemAvatar || null,
            badges: municipioData.badges || 0,
            points: municipioData.points || 0,
            orgao: municipioData.orgao || false
        };
        return await this.municipioRepository.save(municipio);
    }

    async updateMunicipioJson(codIbge, jsonData) {
        const municipio = await this.municipioRepository.findByIdWithJson(codIbge);
        if (!municipio) {
            throw new Error(`Municipio with codIbge ${codIbge} not found`);
        }
        municipio.json = JSON.stringify(jsonData);
        return await this.municipioRepository.save(municipio);
    }
}

module.exports = MunicipioService;
