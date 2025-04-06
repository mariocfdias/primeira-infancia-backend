const MissoesService = require('../service/MissoesService');
const { MissoesDTO } = require('../dto/MissoesDTO');

/**
 * @swagger
 * tags:
 *   name: Missoes
 *   description: Endpoints para gerenciamento de missões
 */
class MissoesController {
    constructor(connection) {
        this.missoesService = new MissoesService(connection);
    }

    /**
     * @swagger
     * /missoes:
     *   get:
     *     summary: Retorna todas as missões
     *     tags: [Missoes]
     *     parameters:
     *       - in: query
     *         name: orgao
     *         schema:
     *           type: string
     *           enum: [PREFEITURA, CAMARA]
     *         required: false
     *         description: Filtrar missões pelo tipo de órgão (PREFEITURA ou CAMARA)
     *     responses:
     *       200:
     *         description: Lista de missões
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
     *                     $ref: '#/components/schemas/Missoes'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async getAllMissoes(req, res) {
        try {
            const { orgao } = req.query;
            // Validate that orgao is either PREFEITURA, CAMARA or undefined
            if (orgao && !['PREFEITURA', 'CAMARA'].includes(orgao)) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: "O parâmetro 'orgao' deve ser 'PREFEITURA' ou 'CAMARA'" 
                });
            }
            
            const missoes = await this.missoesService.findAll(orgao);
            return res.json({ status: 'success', data: missoes });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /missoes/{id}:
     *   get:
     *     summary: Retorna uma missão específica
     *     tags: [Missoes]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID da missão
     *     responses:
     *       200:
     *         description: Dados da missão
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/Missoes'
     *       404:
     *         description: Missão não encontrada
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
    async getMissaoById(req, res) {
        try {
            const { id } = req.params;
            const missao = await this.missoesService.findById(id);
            return res.json({ status: 'success', data: missao });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /missoes:
     *   post:
     *     summary: Cria uma nova missão
     *     tags: [Missoes]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: string
     *                 description: ID da missão
     *               categoria:
     *                 type: string
     *                 description: Categoria da missão
     *               descricao_da_categoria:
     *                 type: string
     *                 description: Descrição da categoria
     *               emblema_da_categoria:
     *                 type: string
     *                 description: URL do emblema da categoria
     *               descricao_da_missao:
     *                 type: string
     *                 description: Descrição da missão
     *               qnt_pontos:
     *                 type: integer
     *                 description: Quantidade de pontos da missão
     *               link_formulario:
     *                 type: string
     *                 description: Link do formulário da missão (opcional)
     *               evidencias:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Lista de evidências (opcional)
     *             required:
     *               - id
     *               - categoria
     *               - descricao_da_categoria
     *               - emblema_da_categoria
     *               - descricao_da_missao
     *               - qnt_pontos
     *     responses:
     *       201:
     *         description: Missão criada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/Missoes'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async createMissao(req, res) {
        try {
            const missaoDTO = MissoesDTO.builder()
                .withId(req.body.id)
                .withCategoria(req.body.categoria)
                .withDescricaoCategoria(req.body.descricao_da_categoria)
                .withEmblemaCategoria(req.body.emblema_da_categoria)
                .withDescricaoMissao(req.body.descricao_da_missao)
                .withQuantidadePontos(req.body.qnt_pontos)
                .withLinkFormulario(req.body.link_formulario)
                .withEvidencias(req.body.evidencias || [])
                .build();

            const newMissao = await this.missoesService.createMissao(missaoDTO);
            return res.status(201).json({ status: 'success', data: newMissao });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /missoes/{id}:
     *   put:
     *     summary: Atualiza uma missão existente
     *     tags: [Missoes]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID da missão
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               categoria:
     *                 type: string
     *                 description: Categoria da missão
     *               descricao_da_categoria:
     *                 type: string
     *                 description: Descrição da categoria
     *               emblema_da_categoria:
     *                 type: string
     *                 description: URL do emblema da categoria
     *               descricao_da_missao:
     *                 type: string
     *                 description: Descrição da missão
     *               qnt_pontos:
     *                 type: integer
     *                 description: Quantidade de pontos da missão
     *               link_formulario:
     *                 type: string
     *                 description: Link do formulário da missão (opcional)
     *               evidencias:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Lista de evidências (opcional)
     *     responses:
     *       200:
     *         description: Missão atualizada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/Missoes'
     *       404:
     *         description: Missão não encontrada
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
    async updateMissao(req, res) {
        try {
            const { id } = req.params;
            
            const missaoDTO = MissoesDTO.builder()
                .withId(id)
                .withCategoria(req.body.categoria)
                .withDescricaoCategoria(req.body.descricao_da_categoria)
                .withEmblemaCategoria(req.body.emblema_da_categoria)
                .withDescricaoMissao(req.body.descricao_da_missao)
                .withQuantidadePontos(req.body.qnt_pontos)
                .withLinkFormulario(req.body.link_formulario)
                .withEvidencias(req.body.evidencias || [])
                .build();

            const updatedMissao = await this.missoesService.updateMissao(id, missaoDTO);
            return res.json({ status: 'success', data: updatedMissao });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /missoes/{id}:
     *   delete:
     *     summary: Remove uma missão
     *     tags: [Missoes]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID da missão
     *     responses:
     *       200:
     *         description: Missão removida com sucesso
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
     *                       example: "Missão with id 'abc123' deleted successfully"
     *       404:
     *         description: Missão não encontrada
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
    async deleteMissao(req, res) {
        try {
            const { id } = req.params;
            const result = await this.missoesService.deleteMissao(id);
            return res.json({ status: 'success', data: result });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
}

module.exports = MissoesController; 