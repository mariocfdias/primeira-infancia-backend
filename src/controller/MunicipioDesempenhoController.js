const MunicipioDesempenhoService = require('../service/MunicipioDesempenhoService');
const { MunicipioDesempenhoDTO } = require('../dto/MunicipioDesempenhoDTO');

/**
 * @swagger
 * tags:
 *   name: Desempenhos
 *   description: Endpoints para gerenciamento de desempenho dos municípios nas missões
 */
class MunicipioDesempenhoController {
    constructor(connection) {
        this.municipioDesempenhoService = new MunicipioDesempenhoService(connection);
    }

    /**
     * @swagger
     * /desempenhos:
     *   get:
     *     summary: Retorna todos os registros de desempenho
     *     tags: [Desempenhos]
     *     parameters:
     *       - in: query
     *         name: orgao
     *         schema:
     *           type: string
     *           enum: [PREFEITURA, CAMARA]
     *         required: false
     *         description: Filtrar por tipo de órgão (PREFEITURA ou CAMARA)
     *     responses:
     *       200:
     *         description: Lista de desempenhos
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/MunicipioDesempenho'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async getAllDesempenhos(req, res) {
        try {
            const { orgao } = req.query;
            console.log(`Fetching all desempenhos, orgao: ${orgao || 'not specified'}`);
            const desempenhos = await this.municipioDesempenhoService.findAll(orgao);
            return res.json({ status: 'success', data: desempenhos });
        } catch (error) {
            console.error('Error fetching all desempenhos:', error.message);
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /desempenhos/{id}:
     *   get:
     *     summary: Retorna um registro de desempenho específico
     *     tags: [Desempenhos]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID do registro de desempenho
     *     responses:
     *       200:
     *         description: Dados do desempenho
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/MunicipioDesempenho'
     *       404:
     *         description: Registro de desempenho não encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async getDesempenhoById(req, res) {
        try {
            const { id } = req.params;
            const desempenho = await this.municipioDesempenhoService.findById(id);
            return res.json({ status: 'success', data: desempenho });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /desempenhos/municipio/{codIbge}:
     *   get:
     *     summary: Retorna todos os registros de desempenho de um município específico
     *     tags: [Desempenhos]
     *     parameters:
     *       - in: path
     *         name: codIbge
     *         schema:
     *           type: string
     *         required: true
     *         description: Código IBGE do município
     *       - in: query
     *         name: orgao
     *         schema:
     *           type: string
     *           enum: [PREFEITURA, CAMARA]
     *         required: false
     *         description: Filtrar por tipo de órgão (PREFEITURA ou CAMARA)
     *     responses:
     *       200:
     *         description: Lista de desempenhos do município
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/MunicipioDesempenho'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async getDesempenhosByIbgeCode(req, res) {
        try {
            const { codIbge } = req.params;
            const { orgao } = req.query;
            console.log(`Fetching desempenhos for codIbge ${codIbge.toUpperCase()}, orgao: ${orgao || 'not specified'}`);
            const desempenhos = await this.municipioDesempenhoService.findByIbgeCode(codIbge, orgao);
            return res.json({ status: 'success', data: desempenhos });
        } catch (error) {
            console.error('Error fetching desempenhos:', error.message);
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /desempenhos/missao/{missaoId}:
     *   get:
     *     summary: Retorna todos os registros de desempenho de uma missão específica
     *     tags: [Desempenhos]
     *     parameters:
     *       - in: path
     *         name: missaoId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID da missão
     *       - in: query
     *         name: orgao
     *         schema:
     *           type: string
     *           enum: [PREFEITURA, CAMARA]
     *         required: false
     *         description: Filtrar por tipo de órgão (PREFEITURA ou CAMARA)
     *     responses:
     *       200:
     *         description: Lista de desempenhos da missão
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/MunicipioDesempenho'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async getDesempenhosByMissaoId(req, res) {
        try {
            const { missaoId } = req.params;
            const { orgao } = req.query;
            console.log(`Fetching desempenhos for missaoId ${missaoId}, orgao: ${orgao || 'not specified'}`);
            const desempenhos = await this.municipioDesempenhoService.findByMissaoId(missaoId, orgao);
            return res.json({ status: 'success', data: desempenhos });
        } catch (error) {
            console.error('Error fetching desempenhos:', error.message);
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /desempenhos:
     *   post:
     *     summary: Cria um novo registro de desempenho
     *     tags: [Desempenhos]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               codIbge:
     *                 type: string
     *                 description: Código IBGE do município
     *               missaoId:
     *                 type: string
     *                 description: ID da missão
     *               validation_status:
     *                 type: string
     *                 enum: [VALID, PENDING, STARTED]
     *                 default: STARTED
     *                 description: Status de validação (opcional)
     *               updated_at:
     *                 type: string
     *                 format: date-time
     *                 description: Data de atualização (opcional)
     *               evidence:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Lista de evidências (opcional)
     *             required:
     *               - codIbge
     *               - missaoId
     *     responses:
     *       201:
     *         description: Registro de desempenho criado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/MunicipioDesempenho'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async createDesempenho(req, res) {
        try {
            const desempenhoDTO = MunicipioDesempenhoDTO.builder()
                .withCodIbge(req.body.codIbge)
                .withMissaoId(req.body.missaoId)
                .withValidationStatus(req.body.validation_status || 'PENDING')
                .withUpdatedAt(req.body.updated_at || new Date())
                .withEvidence(req.body.evidence || [])
                .build();

            const newDesempenho = await this.municipioDesempenhoService.createDesempenho(desempenhoDTO);
            return res.status(201).json({ status: 'success', data: newDesempenho });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /desempenhos/{id}:
     *   put:
     *     summary: Atualiza um registro de desempenho existente
     *     tags: [Desempenhos]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID do registro de desempenho
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               codIbge:
     *                 type: string
     *                 description: Código IBGE do município
     *               missaoId:
     *                 type: string
     *                 description: ID da missão
     *               validation_status:
     *                 type: string
     *                 enum: [VALID, PENDING, STARTED]
     *                 description: Status de validação
     *               updated_at:
     *                 type: string
     *                 format: date-time
     *                 description: Data de atualização (opcional)
     *               evidence:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Lista de evidências
     *     responses:
     *       200:
     *         description: Registro de desempenho atualizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/MunicipioDesempenho'
     *       404:
     *         description: Registro de desempenho não encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async updateDesempenho(req, res) {
        try {
            const { id } = req.params;
            
            const desempenhoDTO = MunicipioDesempenhoDTO.builder()
                .withId(id)
                .withCodIbge(req.body.codIbge)
                .withMissaoId(req.body.missaoId)
                .withValidationStatus(req.body.validation_status)
                .withUpdatedAt(req.body.updated_at || new Date())
                .withEvidence(req.body.evidence || [])
                .build();

            const updatedDesempenho = await this.municipioDesempenhoService.updateDesempenho(id, desempenhoDTO);
            return res.json({ status: 'success', data: updatedDesempenho });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /desempenhos/{id}/status:
     *   patch:
     *     summary: Atualiza apenas o status de validação de um registro de desempenho
     *     tags: [Desempenhos]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID do registro de desempenho
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               status:
     *                 type: string
     *                 enum: [VALID, PENDING, STARTED]
     *                 description: Novo status de validação
     *             required:
     *               - status
     *     responses:
     *       200:
     *         description: Status atualizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/MunicipioDesempenho'
     *       400:
     *         description: Status inválido ou ausente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Registro de desempenho não encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async updateValidationStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!status) {
                return res.status(400).json({ status: 'error', message: 'Status is required' });
            }
            
            const updatedDesempenho = await this.municipioDesempenhoService.updateValidationStatus(id, status);
            return res.json({ status: 'success', data: updatedDesempenho });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            if (error.message.includes('Invalid status')) {
                return res.status(400).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /desempenhos/{id}/evidence:
     *   patch:
     *     summary: Adiciona uma evidência a um registro de desempenho
     *     tags: [Desempenhos]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID do registro de desempenho
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               evidenceUrl:
     *                 type: string
     *                 description: URL da evidência a ser adicionada
     *             required:
     *               - evidenceUrl
     *     responses:
     *       200:
     *         description: Evidência adicionada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/MunicipioDesempenho'
     *       400:
     *         description: URL de evidência ausente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Registro de desempenho não encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async addEvidence(req, res) {
        try {
            const { id } = req.params;
            const { evidenceUrl } = req.body;
            
            if (!evidenceUrl) {
                return res.status(400).json({ status: 'error', message: 'Evidence URL is required' });
            }
            
            const updatedDesempenho = await this.municipioDesempenhoService.addEvidence(id, evidenceUrl);
            return res.json({ status: 'success', data: updatedDesempenho });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /desempenhos/{id}:
     *   delete:
     *     summary: Remove um registro de desempenho
     *     tags: [Desempenhos]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID do registro de desempenho
     *     responses:
     *       200:
     *         description: Registro de desempenho removido com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   type: object
     *                   properties:
     *                     success:
     *                       type: boolean
     *                       example: true
     *                     message:
     *                       type: string
     *                       example: "MunicipioDesempenho with id 1 deleted successfully"
     *       404:
     *         description: Registro de desempenho não encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async deleteDesempenho(req, res) {
        try {
            const { id } = req.params;
            const result = await this.municipioDesempenhoService.deleteDesempenho(id);
            return res.json({ status: 'success', data: result });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /desempenhos/municipio/{codIbge}/missao/{missaoId}:
     *   get:
     *     summary: Retorna o registro de desempenho de um município em uma missão específica
     *     tags: [Desempenhos]
     *     parameters:
     *       - in: path
     *         name: codIbge
     *         schema:
     *           type: string
     *         required: true
     *         description: Código IBGE do município
     *       - in: path
     *         name: missaoId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID da missão
     *       - in: query
     *         name: orgao
     *         schema:
     *           type: string
     *           enum: [PREFEITURA, CAMARA]
     *         required: false
     *         description: Filtrar por tipo de órgão (PREFEITURA ou CAMARA)
     *     responses:
     *       200:
     *         description: Dados do desempenho
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/MunicipioDesempenho'
     *       404:
     *         description: Registro de desempenho não encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async getDesempenhoByIbgeCodeAndMissaoId(req, res) {
        try {
            const { codIbge, missaoId } = req.params;
            const { orgao } = req.query;
            console.log(`Fetching desempenho for codIbge ${codIbge.toUpperCase()} and missaoId ${missaoId}, orgao: ${orgao}`);
            const desempenho = await this.municipioDesempenhoService.findByIbgeCodeAndMissaoId(codIbge, missaoId, orgao);
            console.log('Found desempenho:', JSON.stringify(desempenho));
            return res.json({ status: 'success', data: desempenho });
        } catch (error) {
            console.error('Error fetching desempenho:', error.message);
            if (error.message.includes('not found')) {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
}

module.exports = MunicipioDesempenhoController; 