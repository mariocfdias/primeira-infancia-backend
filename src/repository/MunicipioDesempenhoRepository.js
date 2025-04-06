class MunicipioDesempenhoRepository {
    constructor(connection) {
        this.repository = connection.getRepository("MunicipioDesempenho");
    }

    async findAll(orgao) {
        if (orgao) {
            return await this.repository.createQueryBuilder("desempenho")
                .leftJoinAndSelect("desempenho.municipio", "municipio")
                .leftJoinAndSelect("desempenho.missao", "missao")
                .where("desempenho.codIbge LIKE :orgao", { orgao: `%${orgao}%` })
                .getMany();
        } else {
            return await this.repository.createQueryBuilder("desempenho")
                .leftJoinAndSelect("desempenho.municipio", "municipio")
                .leftJoinAndSelect("desempenho.missao", "missao")
                .getMany();
        }
    }

    async findById(id) {
        return await this.repository.findOne({
            where: { id },
            relations: ["municipio", "missao"]
        });
    }

    async findByIbgeCode(codIbge, orgao) {
        if (orgao) {
            return await this.repository.createQueryBuilder("desempenho")
                .leftJoinAndSelect("desempenho.municipio", "municipio")
                .leftJoinAndSelect("desempenho.missao", "missao")
                .where("desempenho.codIbge LIKE :codIbge", { codIbge: `%${codIbge}%` })
                .andWhere("desempenho.codIbge LIKE :orgao", { orgao: `%${orgao}%` })
                .getMany();
        } else {
            return await this.repository.createQueryBuilder("desempenho")
                .leftJoinAndSelect("desempenho.municipio", "municipio")
                .leftJoinAndSelect("desempenho.missao", "missao")
                .where("desempenho.codIbge LIKE :codIbge", { codIbge: `%${codIbge}%` })
                .getMany();
        }
    }

    async findByMissaoId(missaoId, orgao) {
        if (orgao) {
            return await this.repository.createQueryBuilder("desempenho")
                .leftJoinAndSelect("desempenho.municipio", "municipio")
                .leftJoinAndSelect("desempenho.missao", "missao")
                .where("desempenho.missaoId LIKE :missaoId", { missaoId: `%${missaoId}%` })
                .andWhere("desempenho.codIbge LIKE :orgao", { orgao: `%${orgao}%` })
                .getMany();
        } else {
            return await this.repository.createQueryBuilder("desempenho")
                .leftJoinAndSelect("desempenho.municipio", "municipio")
                .leftJoinAndSelect("desempenho.missao", "missao")
                .where("desempenho.missaoId LIKE :missaoId", { missaoId: `%${missaoId}%` })
                .getMany();
        }
    }

    async findLatestUpdateDateByMissaoId(missaoId) {
        const result = await this.repository
            .createQueryBuilder("desempenho")
            .select("MAX(desempenho.updated_at)", "latestDate")
            .where("desempenho.missaoId LIKE :missaoId", { missaoId: `%${missaoId}%` })
            .getRawOne();
        
        return result?.latestDate ? new Date(result.latestDate) : new Date(0);
    }

    async findLatestUpdateDateByOrgao(codIbge) {
        const result = await this.repository
            .createQueryBuilder("desempenho")
            .select("MAX(desempenho.updated_at)", "latestDate")
            .where("desempenho.codIbge LIKE :codIbge", { codIbge: `%${codIbge}%` })
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
            .where("codIbge LIKE :codIbge", { codIbge: `%${codIbge}%` })
            .execute();
    }

    async findByIbgeCodeAndMissaoId(codIbge, missaoId, orgao) {
        const queryBuilder = this.repository
            .createQueryBuilder("desempenho")
            .leftJoinAndSelect("desempenho.municipio", "municipio")
            .leftJoinAndSelect("desempenho.missao", "missao")
            .where("desempenho.codIbge LIKE :codIbge", { codIbge: `%${codIbge}%` })
            .andWhere("desempenho.missaoId LIKE :missaoId", { missaoId: `%${missaoId}%` });
            
        if (orgao) {
            queryBuilder.andWhere("desempenho.codIbge LIKE :orgao", { orgao: `%${orgao}%` });
        }
        
        return await queryBuilder.getOne();
    }

    async findAllWithRelations() {
        return await this.repository.createQueryBuilder("desempenho")
            .leftJoinAndSelect("desempenho.missao", "missao")
            .getMany();
    }
}

module.exports = MunicipioDesempenhoRepository; 