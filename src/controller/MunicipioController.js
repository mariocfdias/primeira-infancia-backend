const MunicipioService = require('../service/MunicipioService');

/**
 * @swagger
 * tags:
 *   name: Municipios
 *   description: Endpoints para gerenciamento de municípios
 */
class MunicipioController {
    constructor(connection) {
        this.municipioService = new MunicipioService(connection);
    }

    /**
     * @swagger
     * /municipios:
     *   get:
     *     summary: Retorna todos os municípios (excluindo órgãos)
     *     tags: [Municipios]
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
     *         description: Lista de municípios (excluindo órgãos)
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
     *                     $ref: '#/components/schemas/Municipio'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async getAllMunicipios(req, res) {
        try {
            const { orgao } = req.query;
            const municipios = await this.municipioService.findAll(orgao);
            return res.json({ status: 'success', data: municipios });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /municipios/{ibge}:
     *   get:
     *     summary: Retorna um município específico com seus desempenhos e missões relacionadas
     *     tags: [Municipios]
     *     parameters:
     *       - in: path
     *         name: ibge
     *         schema:
     *           type: string
     *         required: true
     *         description: Código IBGE do município
     *     responses:
     *       200:
     *         description: Dados completos do município, incluindo desempenhos e missões
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
     *                     codIbge:
     *                       type: string
     *                     nome:
     *                       type: string
     *                     status:
     *                       type: string
     *                     dataAlteracao:
     *                       type: string
     *                       format: date-time
     *                     imagemAvatar:
     *                       type: string
     *                       nullable: true
     *                     badges:
     *                       type: integer
     *                     points:
     *                       type: integer
     *                     json:
     *                       type: object
     *                       nullable: true
     *                     orgao:
     *                       type: boolean
     *                     desempenhos:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: integer
     *                           codIbge:
     *                             type: string
     *                           missaoId:
     *                             type: string
     *                           validation_status:
     *                             type: string
     *                           updated_at:
     *                             type: string
     *                             format: date-time
     *                           evidence:
     *                             type: array
     *                           missao:
     *                             type: object
     *                             properties:
     *                               id:
     *                                 type: string
     *                               categoria:
     *                                 type: string
     *                               descricao_da_categoria:
     *                                 type: string
     *                               emblema_da_categoria:
     *                                 type: string
     *                               descricao_da_missao:
     *                                 type: string
     *                               qnt_pontos:
     *                                 type: integer
     *                               link_formulario:
     *                                 type: string
     *                                 nullable: true
     *                               evidencias:
     *                                 type: array
     *       404:
     *         description: Município não encontrado
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
    async getMunicipioByIdWithJson(req, res) {
        try {
            const { ibge } = req.params;
            console.log({codIbge: ibge.toUpperCase()})
            const municipio = await this.municipioService.findMunicipioCompleto(ibge);
            if (!municipio) {
                return res.status(404).json({ status: 'error', message: 'Municipio não encontrado' });
            }
            return res.json({ status: 'success', data: municipio });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /municipios/search:
     *   get:
     *     summary: Busca municípios por nome
     *     tags: [Municipios]
     *     parameters:
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         required: true
     *         description: Texto para busca por nome
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         required: false
     *         description: Número máximo de resultados a retornar
     *       - in: query
     *         name: orgao
     *         schema:
     *           type: string
     *           enum: [PREFEITURA, CAMARA]
     *         required: false
     *         description: Filtrar por tipo de órgão (PREFEITURA ou CAMARA)
     *     responses:
     *       200:
     *         description: Lista de municípios que correspondem à busca
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
     *                     $ref: '#/components/schemas/Municipio'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async searchMunicipios(req, res) {
        try {
            const { search, limit, orgao } = req.query;
            const municipios = await this.municipioService.searchByName(search, Number(limit) || 10, orgao);
            return res.json({ status: 'success', data: municipios });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /municipios/participantes:
     *   get:
     *     summary: Retorna todos os municípios participantes
     *     tags: [Municipios]
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
     *         description: Lista de municípios participantes
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
     *                     $ref: '#/components/schemas/Municipio'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async getParticipantes(req, res) {
        try {
            const { orgao } = req.query;
            const municipios = await this.municipioService.findParticipantes(orgao);
            return res.json({ status: 'success', data: municipios });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
}

module.exports = MunicipioController;
