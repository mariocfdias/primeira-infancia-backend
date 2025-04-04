class MunicipioDesempenhoRepository {
    constructor(connection) {
        this.repository = connection.getRepository("MunicipioDesempenho");
    }

    async findAll() {
        return await this.repository.find({
            relations: ["municipio", "missao"]
        });
    }

    async findById(id) {
        return await this.repository.findOne({
            where: { id },
            relations: ["municipio", "missao"]
        });
    }

    async findByIbgeCode(codIbge) {
        return await this.repository.find({
            where: { codIbge },
            relations: ["municipio", "missao"]
        });
    }

    async findByMissaoId(missaoId) {
        return await this.repository.find({
            where: { missaoId },
            relations: ["municipio", "missao"]
        });
    }

    async findLatestUpdateDateByMissaoId(missaoId) {
        const result = await this.repository
            .createQueryBuilder("desempenho")
            .select("MAX(desempenho.updated_at)", "latestDate")
            .where("desempenho.missaoId = :missaoId", { missaoId })
            .getRawOne();
        
        return result?.latestDate ? new Date(result.latestDate) : new Date(0);
    }

    async findLatestUpdateDateByOrgao(codIbge) {
        const result = await this.repository
            .createQueryBuilder("desempenho")
            .select("MAX(desempenho.updated_at)", "latestDate")
            .where("desempenho.codIbge = :codIbge", { codIbge })
            .getRawOne();
        
        return result?.latestDate ? new Date(result.latestDate) : new Date(0);
    }

    async create(desempenho) {
        return await this.repository.save(desempenho);
    }

    async update(id, desempenho) {
        await this.repository.update(id, desempenho);
        return await this.findById(id);
    }

    async delete(id) {
        return await this.repository.delete(id);
    }

    async deleteByIbgeCode(codIbge) {
        return await this.repository
            .createQueryBuilder()
            .delete()
            .where("codIbge = :codIbge", { codIbge })
            .execute();
    }

    async findByIbgeCodeAndMissaoId(codIbge, missaoId) {
        const result = await this.repository
            .createQueryBuilder("desempenho")
            .leftJoinAndSelect("desempenho.municipio", "municipio")
            .leftJoinAndSelect("desempenho.missao", "missao")
            .where("desempenho.codIbge = :codIbge", { codIbge })
            .andWhere("desempenho.missaoId = :missaoId", { missaoId })
            .getOne();
                    
        return result;
    }

    async findAllWithRelations() {
        return await this.repository.createQueryBuilder("desempenho")
            .leftJoinAndSelect("desempenho.missao", "missao")
            .getMany();
    }
}

module.exports = MunicipioDesempenhoRepository; 