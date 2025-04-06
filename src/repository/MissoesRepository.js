class MissoesRepository {
    constructor(connection) {
        this.repository = connection.getRepository("Missoes");
    }

    async findAll() {
        return await this.repository.find();
    }

    async findAllByOrgao(orgao) {
        return await this.repository.createQueryBuilder("missoes")
            .where("missoes.id LIKE :orgao", { orgao: `%${orgao}%` })
            .getMany();
    }

    async findAllByCode(code) {
        return await this.repository.createQueryBuilder("missoes")
            .where("missoes.id LIKE :id", { id: `%${code}%` })
            .getMany();
    }

    async findById(id) {
        return await this.repository.findOne({
            where: { id }
        });
    }

    async create(missao) {
        return await this.repository.save(missao);
    }

    async update(id, missao) {
        await this.repository.update(id, missao);
        return await this.findById(id);
    }

    async delete(id) {
        return await this.repository.delete(id);
    }
}

module.exports = MissoesRepository; 