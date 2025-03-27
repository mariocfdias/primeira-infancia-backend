const MunicipioDesempenhoRepository = require('../repository/MunicipioDesempenhoRepository');
const { MunicipioDesempenhoDTO } = require('../dto/MunicipioDesempenhoDTO');

class MunicipioDesempenhoService {
    constructor(connection) {
        this.municipioDesempenhoRepository = new MunicipioDesempenhoRepository(connection);
    }

    async findAll() {
        const desempenhos = await this.municipioDesempenhoRepository.findAll();
        return desempenhos.map(desempenho => MunicipioDesempenhoDTO.fromEntity(desempenho));
    }

    async findById(id) {
        const desempenho = await this.municipioDesempenhoRepository.findById(id);
        if (!desempenho) {
            throw new Error(`MunicipioDesempenho with id ${id} not found`);
        }
        return MunicipioDesempenhoDTO.fromEntity(desempenho);
    }

    async findByIbgeCode(codIbge) {
        const desempenhos = await this.municipioDesempenhoRepository.findByIbgeCode(codIbge);
        return desempenhos.map(desempenho => MunicipioDesempenhoDTO.fromEntity(desempenho));
    }

    async findByMissaoId(missaoId) {
        const desempenhos = await this.municipioDesempenhoRepository.findByMissaoId(missaoId);
        return desempenhos.map(desempenho => MunicipioDesempenhoDTO.fromEntity(desempenho));
    }

    async getLatestUpdateDateByMissaoId(missaoId) {
        return await this.municipioDesempenhoRepository.findLatestUpdateDateByMissaoId(missaoId);
    }

    async createDesempenho(desempenhoDTO) {
        const entity = desempenhoDTO.toEntity();
        const savedDesempenho = await this.municipioDesempenhoRepository.create(entity);
        return MunicipioDesempenhoDTO.fromEntity(savedDesempenho);
    }

    async updateDesempenho(id, desempenhoDTO) {
        const desempenho = await this.municipioDesempenhoRepository.findById(id);
        if (!desempenho) {
            throw new Error(`MunicipioDesempenho with id ${id} not found`);
        }
        
        const entity = desempenhoDTO.toEntity();
        const updatedDesempenho = await this.municipioDesempenhoRepository.update(id, entity);
        return MunicipioDesempenhoDTO.fromEntity(updatedDesempenho);
    }

    async updateValidationStatus(id, status) {
        if (!['VALID', 'PENDING', 'STARTED'].includes(status)) {
            throw new Error(`Invalid status: ${status}. Status must be one of: VALID, PENDING, STARTED`);
        }
        
        const desempenho = await this.municipioDesempenhoRepository.findById(id);
        if (!desempenho) {
            throw new Error(`MunicipioDesempenho with id ${id} not found`);
        }
        
        desempenho.validation_status = status;
        desempenho.updated_at = new Date();
        
        const updatedDesempenho = await this.municipioDesempenhoRepository.update(id, desempenho);
        return MunicipioDesempenhoDTO.fromEntity(updatedDesempenho);
    }

    async addEvidence(id, evidenceUrl) {
        const desempenho = await this.municipioDesempenhoRepository.findById(id);
        if (!desempenho) {
            throw new Error(`MunicipioDesempenho with id ${id} not found`);
        }
        
        const evidence = desempenho.evidence ? JSON.parse(desempenho.evidence) : [];
        evidence.push(evidenceUrl);
        
        desempenho.evidence = JSON.stringify(evidence);
        desempenho.updated_at = new Date();
        
        const updatedDesempenho = await this.municipioDesempenhoRepository.update(id, desempenho);
        return MunicipioDesempenhoDTO.fromEntity(updatedDesempenho);
    }

    async deleteDesempenho(id) {
        const desempenho = await this.municipioDesempenhoRepository.findById(id);
        if (!desempenho) {
            throw new Error(`MunicipioDesempenho with id ${id} not found`);
        }
        
        await this.municipioDesempenhoRepository.delete(id);
        return { success: true, message: `MunicipioDesempenho with id ${id} deleted successfully` };
    }

    async findByIbgeCodeAndMissaoId(codIbge, missaoId) {
        const desempenho = await this.municipioDesempenhoRepository.findByIbgeCodeAndMissaoId(codIbge, missaoId);
        if (!desempenho) {
            throw new Error(`MunicipioDesempenho with codIbge ${codIbge} and missaoId ${missaoId} not found`);
        }
        return MunicipioDesempenhoDTO.fromEntity(desempenho);
    }
}

module.exports = MunicipioDesempenhoService; 