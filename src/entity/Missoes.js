const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
    name: "Missoes",
    tableName: "missions",
    columns: {
        id: {
            primary: true,
            type: "varchar"
        },
        categoria: {
            type: "varchar"
        },
        descricao_da_categoria: {
            type: "varchar"
        },
        emblema_da_categoria: {
            type: "varchar"
        },
        descricao_da_missao: {
            type: "varchar"
        },
        qnt_pontos: {
            type: "int",
            default: 0
        },
        link_formulario: {
            type: "varchar",
            nullable: true
        },
        evidencias: {
            type: "simple-json",
            nullable: true,
            default: "[]"
        }
    }
}); 