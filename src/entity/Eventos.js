const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
    name: "Eventos",
    tableName: "events",
    columns: {
        id: {
            primary: true,
            type: "numeric",
            generated: true
        },
        data_alteracao: {
            type: "datetime"
        },
        cod_ibge: {
            type: "varchar"
        },
        event: {
            type: "varchar"
        },
        description: {
            type: "varchar"
        }
    },
    relations: {
        municipio: {
            target: "Municipio",
            type: "many-to-one",
            joinColumn: {
                name: "cod_ibge",
                referencedColumnName: "codIbge"
            }
        }
    }
}); 