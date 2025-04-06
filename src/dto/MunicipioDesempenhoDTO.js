class MunicipioDesempenhoDTO {
    constructor() {
        this.id = null;
        this.codIbge = '';
        this.missaoId = '';
        this.validation_status = 'STARTED';
        this.updated_at = new Date();
        this.evidence = [];
        this.municipio = null;
        this.missao = null;
    }

    static builder() {
        return new MunicipioDesempenhoBuilder();
    }

    static fromEntity(entity) {
        const dto = MunicipioDesempenhoDTO.builder()
            .withId(entity.id)
            .withCodIbge(entity.codIbge ? entity.codIbge.toUpperCase() : entity.codIbge)
            .withMissaoId(entity.missaoId)
            .withValidationStatus(entity.validation_status)
            .withUpdatedAt(entity.updated_at)
            .withEvidence([]);

        // Match evidence with evidencias based on array position
        if (entity.missao && entity.missao.evidencias) {
            if(entity.validation_status != "PENDING"){
                console.log('entity.missao.evidencias', entity.missao.evidencias);
                console.log('entity.evidence', entity.evidence);
            }
            let evidenciasArray = [];
            try {
                evidenciasArray = typeof entity.missao.evidencias === 'string'
                    ? JSON.parse(entity.missao.evidencias)
                    : entity.missao.evidencias;
            } catch (e) {
                evidenciasArray = [];
            }

            // Parse entity evidence array
            const entityEvidenceArray = entity.evidence
                ? (entity.evidence.length > 0 ? JSON.parse(entity.evidence) : [])
                : [];

            // Create enhanced evidence array from missao.evidencias
            // and add links from entity.evidence where available
            const enhancedEvidence = evidenciasArray.map((evidenciaItem, index) => {
                // Find matching evidence in entity evidence by index
                const matchingEvidence = index < entityEvidenceArray.length ? entityEvidenceArray[index] : null;

                return {
                    ...evidenciaItem,
                    evidence: matchingEvidence?.evidencia || null
                };
            });

            dto.withEvidence(enhancedEvidence);
        }

        if (entity.municipio) {
            dto.withMunicipio({
                codIbge: entity.municipio.codIbge,
                nome: entity.municipio.nome,
                status: entity.municipio.status,
                points: entity.municipio.points,
                badges: entity.municipio.badges,
                imagemAvatar: entity.municipio.imagemAvatar
            });
        }

        if (entity.missao) {
            const missaoObj = {
                id: entity.missao.id,
                categoria: entity.missao.categoria,
                descricao_da_categoria: entity.missao.descricao_da_categoria,
                emblema_da_categoria: entity.missao.emblema_da_categoria,
                descricao_da_missao: entity.missao.descricao_da_missao,
                qnt_pontos: entity.missao.qnt_pontos,
                link_formulario: entity.missao.link_formulario
            };

            if (entity.missao.evidencias) {
                try {
                    missaoObj.evidencias = typeof entity.missao.evidencias === 'string'
                        ? JSON.parse(entity.missao.evidencias)
                        : entity.missao.evidencias;
                } catch (e) {
                    missaoObj.evidencias = [];
                }
            } else {
                missaoObj.evidencias = [];
            }

            dto.withMissao(missaoObj);
        }

        return dto.build();
    }

    toEntity() {
        return {
            id: this.id,
            codIbge: this.codIbge,
            missaoId: this.missaoId,
            validation_status: this.validation_status,
            updated_at: this.updated_at,
            evidence: JSON.stringify(this.evidence)
        };
    }
}

class MunicipioDesempenhoBuilder {
    constructor() {
        this.dto = new MunicipioDesempenhoDTO();
    }

    withId(id) {
        this.dto.id = id;
        return this;
    }

    withCodIbge(codIbge) {
        this.dto.codIbge = codIbge ? codIbge.toString().toUpperCase() : codIbge;
        return this;
    }

    withMissaoId(missaoId) {
        this.dto.missaoId = missaoId;
        return this;
    }

    withValidationStatus(status) {
        this.dto.validation_status = status;
        return this;
    }

    withUpdatedAt(date) {
        this.dto.updated_at = date;
        return this;
    }

    withEvidence(evidence) {
        this.dto.evidence = evidence;
        return this;
    }

    withMunicipio(municipio) {
        this.dto.municipio = municipio;
        return this;
    }

    withMissao(missao) {
        this.dto.missao = missao;
        return this;
    }

    build() {
        return this.dto;
    }
}

module.exports = { MunicipioDesempenhoDTO, MunicipioDesempenhoBuilder };