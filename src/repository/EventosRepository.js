class EventosRepository {
    constructor(connection) {
        this.repository = connection.getRepository("Eventos");
    }

    async findAll(options = {}) {
        const { page = 0, limit = 10, event, municipioSearch, sortDirection = "DESC", orgao } = options;
        const skip = page * limit;
        
        const queryBuilder = this.repository.createQueryBuilder("eventos")
            .leftJoinAndSelect("eventos.municipio", "municipio")
            .orderBy("eventos.data_alteracao", sortDirection)
            .skip(skip)
            .take(limit);
            
        if (event) {
            queryBuilder.andWhere("eventos.event LIKE :event", { event: `%${event}%` });
        }
        
        if (municipioSearch) {
            queryBuilder.andWhere("municipio.nome LIKE :municipioSearch", { municipioSearch: `%${municipioSearch}%` });
        }

        if (orgao) {
            queryBuilder.andWhere("eventos.cod_ibge LIKE :orgao", { orgao: `%${orgao}%` });
        }
        
        const [results, total] = await queryBuilder.getManyAndCount();
        
        return { 
            data: results, 
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        };
    }

    async findById(id) {
        return await this.repository.findOne({
            where: { id },
            relations: ["municipio"]
        });
    }

    async findByCodIbge(codIbge, options = {}) {
        const { page = 0, limit = 10, event, sortDirection = "DESC" } = options;
        const skip = page * limit;
        
        const queryBuilder = this.repository.createQueryBuilder("eventos")
            .leftJoinAndSelect("eventos.municipio", "municipio")
            .where("eventos.cod_ibge = :codIbge", { codIbge })
            .orderBy("eventos.data_alteracao", sortDirection)
            .skip(skip)
            .take(limit);
            
        if (event) {
            queryBuilder.andWhere("eventos.event LIKE :event", { event: `%${event}%` });
        }
        
        const [results, total] = await queryBuilder.getManyAndCount();
        
        return { 
            data: results, 
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        };
    }

    async create(evento) {
        return await this.repository.save(evento);
    }

    async update(id, evento) {
        await this.repository.update(id, evento);
        return await this.findById(id);
    }

    async delete(id) {
        return await this.repository.delete(id);
    }
}

module.exports = EventosRepository; 