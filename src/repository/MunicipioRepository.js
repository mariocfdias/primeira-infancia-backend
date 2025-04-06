class MunicipioRepository {
    constructor(connection) {
        this.repository = connection.getRepository("Municipio");
        this.municipioDesempenhoRepository = connection.getRepository("MunicipioDesempenho");
    }

    async findAll(orgao) {
        if (orgao) {
            return await this.repository.createQueryBuilder("municipio")
                .where("municipio.codIbge LIKE :orgao", { orgao: `%${orgao}%` })
                .select(["municipio.codIbge", "municipio.nome", "municipio.status", "municipio.badges", "municipio.points", "municipio.imagemAvatar"])
                .getMany();
        } else {
            return await this.repository.find({
                where: { orgao: false},
                select: ["codIbge", "nome", "status", "badges", "points", "imagemAvatar"]
            });
        }
    }

    async findParticipantes(orgao) {
        if (orgao) {
            return await this.repository.createQueryBuilder("municipio")
                .where("municipio.status = :status AND municipio.codIbge LIKE :orgao", 
                    { status: "Participante", orgao: `%${orgao}%` })
                .select(["municipio.codIbge", "municipio.nome", "municipio.status", "municipio.badges", "municipio.points", "municipio.imagemAvatar", "municipio.orgao"])
                .getMany();
        } else {
            return await this.repository.find({
                where: { status: "Participante", orgao: false },
                select: ["codIbge", "nome", "status", "badges", "points", "imagemAvatar", "orgao"]
            });
        }
    }

    async findByIdWithJson(codIbge) {
        return await this.repository.findOne({
            where: { codIbge }
        });
    }

    async findOne(codIbge) {
        return await this.repository.findOne({
            where: { codIbge },
            select: ["codIbge", "nome", "status", "badges", "points", "imagemAvatar", "orgao"]
        });
    }

    async searchByName(search, limit = 10, orgao) {
        const queryBuilder = this.repository.createQueryBuilder("municipio");
        
        if (orgao) {
            queryBuilder
                .where("municipio.nome LIKE :search AND municipio.codIbge LIKE :orgao", 
                    { search: `%${search}%`, orgao: `%${orgao}%` });
        } else {
            queryBuilder
                .where("municipio.nome LIKE :search AND municipio.orgao = :orgaoFlag", 
                    { search: `%${search}%`, orgaoFlag: false });
        }
        
        return await queryBuilder
            .select(["municipio.codIbge", "municipio.nome", "municipio.status", "municipio.badges", "municipio.points", "municipio.imagemAvatar"])
            .take(limit)
            .getMany();
    }

    async save(municipio) {
        return await this.repository.save(municipio);
    }

    async getMaxDataAlteracao() {
        const result = await this.repository.createQueryBuilder("municipio")
            .select("MAX(municipio.dataAlteracao)", "maxDate")
            .getRawOne();
        console.log({result})
        return result?.maxDate ? new Date(result.maxDate) : new Date(0);
    }

    async findByIdWithDesempenhoEMissoes(codIbge) {
        const municipio = await this.repository.findOne({
            where: { codIbge }
        });
        
        if (!municipio) {
            return null;
        }
        
        // Get all MunicipioDesempenho records related to this municipality
        const desempenhos = await this.municipioDesempenhoRepository.find({
            where: { codIbge },
            relations: ["missao"]
        });
        
        // Add desempenhos to the municipio object
        municipio.desempenhos = desempenhos;
        
        return municipio;
    }
}

module.exports = MunicipioRepository;
