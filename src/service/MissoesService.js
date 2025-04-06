const MissoesRepository = require('../repository/MissoesRepository');
const { MissoesDTO } = require('../dto/MissoesDTO');

class MissoesService {
    constructor(connection) {
        this.missoesRepository = new MissoesRepository(connection);
    }

    async findAll(orgao) {
        if (orgao) {
            const missoes = await this.missoesRepository.findAllByOrgao(orgao);
            return missoes.map(missao => MissoesDTO.fromEntity(missao));
        } else {
            const missoes = await this.missoesRepository.findAll();
            return missoes.map(missao => MissoesDTO.fromEntity(missao));
        }
    }

    async findById(id) {
        const missao = await this.missoesRepository.findById(id);
        if (!missao) {
            throw new Error(`Missão with id ${id} not found`);
        }
        return MissoesDTO.fromEntity(missao);
    }

    async createMissao(missaoDTO) {
        const entity = missaoDTO.toEntity();
        const savedMissao = await this.missoesRepository.create(entity);
        return MissoesDTO.fromEntity(savedMissao);
    }

    async updateMissao(id, missaoDTO) {
        const missao = await this.missoesRepository.findById(id);
        if (!missao) {
            throw new Error(`Missão with id ${id} not found`);
        }
        
        const entity = missaoDTO.toEntity();
        const updatedMissao = await this.missoesRepository.update(id, entity);
        return MissoesDTO.fromEntity(updatedMissao);
    }

    async deleteMissao(id) {
        const missao = await this.missoesRepository.findById(id);
        if (!missao) {
            throw new Error(`Missão with id ${id} not found`);
        }
        
        await this.missoesRepository.delete(id);
        return { success: true, message: `Missão with id ${id} deleted successfully` };
    }
}

module.exports = MissoesService; 