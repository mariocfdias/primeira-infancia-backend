const EventosService = require('../service/EventosService');
const MunicipioService = require('../service/MunicipioService');
const { EventosDTO } = require('../dto/EventosDTO');

/**
 * @swagger
 * tags:
 *   name: Eventos
 *   description: Endpoints para gerenciamento de eventos
 * 
 * components:
 *   schemas:
 *     Eventos:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do evento
 *         data_alteracao:
 *           type: string
 *           format: date-time
 *           description: Data do evento
 *         event:
 *           type: string
 *           description: Nome do evento
 *         description:
 *           type: string
 *           description: Descrição do evento
 *         cod_ibge:
 *           type: string
 *           description: Código IBGE do município
 *         municipio:
 *           type: object
 *           properties:
 *             codIbge:
 *               type: string
 *               description: Código IBGE do município
 *             nome:
 *               type: string
 *               description: Nome do município
 *             status:
 *               type: string
 *               description: Status do município
 *             badges:
 *               type: integer
 *               description: Número de badges do município
 *             points:
 *               type: integer
 *               description: Pontuação do município
 *             imagemAvatar:
 *               type: string
 *               description: URL da imagem do avatar do município
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de registros
 *         page:
 *           type: integer
 *           description: Página atual
 *         limit:
 *           type: integer
 *           description: Limite de registros por página
 *         pages:
 *           type: integer
 *           description: Total de páginas
 */

class EventosController {
    constructor(connection) {
        this.eventosService = new EventosService(connection);
        this.municipioService = new MunicipioService(connection);
    }

    /**
     * @swagger
     * /eventos:
     *   get:
     *     summary: Retorna todos os eventos
     *     tags: [Eventos]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 0
     *         description: Página a ser retornada (iniciando em 0)
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Número de registros por página
     *       - in: query
     *         name: event
     *         schema:
     *           type: string
     *         description: Filtro por nome do evento
     *       - in: query
     *         name: municipioSearch
     *         schema:
     *           type: string
     *         description: Filtro por nome do município
     *       - in: query
     *         name: sortDirection
     *         schema:
     *           type: string
     *           enum: [ASC, DESC]
     *           default: DESC
     *         description: Direção da ordenação por data
     *       - in: query
     *         name: orgao
     *         schema:
     *           type: string
     *           enum: [CAMARA, PREFEITURA]
     *         description: Filtro por órgão (CAMARA ou PREFEITURA) contido no cod_ibge
     *     responses:
     *       200:
     *         description: Lista de eventos
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
     *                     $ref: '#/components/schemas/Eventos'
     *                 pagination:
     *                   $ref: '#/components/schemas/Pagination'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async getAllEventos(req, res) {
        try {
            const { page, limit, event, municipioSearch, sortDirection, orgao } = req.query;

            // Validate orgao parameter
            const validOrgaoValues = ["CAMARA", "PREFEITURA", undefined, null];
            const orgaoUpper = orgao?.toUpperCase();
            if (!validOrgaoValues.includes(orgaoUpper)) {
                return res.status(400).json({ status: 'error', message: 'Invalid value for orgao parameter. Allowed values are CAMARA or PREFEITURA.' });
            }

            const eventos = await this.eventosService.findAll({ 
                page: parseInt(page) || 0, 
                limit: parseInt(limit) || 10,
                event,
                municipioSearch,
                sortDirection: sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
                orgao: orgaoUpper // Pass validated and uppercased value
            });
            return res.json({ 
                status: 'success', 
                data: eventos.data,
                pagination: eventos.pagination
            });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /eventos/{id}:
     *   get:
     *     summary: Retorna um evento específico
     *     tags: [Eventos]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID do evento
     *     responses:
     *       200:
     *         description: Dados do evento
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/Eventos'
     *       404:
     *         description: Evento não encontrado
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
    async getEventoById(req, res) {
        try {
            const { id } = req.params;
            const evento = await this.eventosService.findById(id);
            return res.json({ status: 'success', data: evento });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /eventos:
     *   post:
     *     summary: Cria um novo evento
     *     tags: [Eventos]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               data_alteracao:
     *                 type: string
     *                 format: date-time
     *                 description: Data do evento (opcional, padrão é a data atual)
     *               event:
     *                 type: string
     *                 description: Nome do evento
     *               description:
     *                 type: string
     *                 description: Descrição do evento
     *               cod_ibge:
     *                 type: string
     *                 description: Código IBGE do município relacionado
     *             required:
     *               - event
     *               - description
     *     responses:
     *       201:
     *         description: Evento criado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/Eventos'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async createEvento(req, res) {
        try {
            const eventoDTO = EventosDTO.builder()
                .withDataAlteracao(req.body.data_alteracao || new Date())
                .withEvent(req.body.event)
                .withDescription(req.body.description)
                .withCodIbge(req.body.cod_ibge)
                .build();

            const newEvento = await this.eventosService.createEvento(eventoDTO);
            return res.status(201).json({ status: 'success', data: newEvento });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /eventos/{id}:
     *   put:
     *     summary: Atualiza um evento existente
     *     tags: [Eventos]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID do evento
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               data_alteracao:
     *                 type: string
     *                 format: date-time
     *                 description: Data do evento (opcional, padrão é a data atual)
     *               event:
     *                 type: string
     *                 description: Nome do evento
     *               description:
     *                 type: string
     *                 description: Descrição do evento
     *               cod_ibge:
     *                 type: string
     *                 description: Código IBGE do município relacionado
     *     responses:
     *       200:
     *         description: Evento atualizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/Eventos'
     *       404:
     *         description: Evento não encontrado
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
    async updateEvento(req, res) {
        try {
            const { id } = req.params;
            
            const eventoDTO = EventosDTO.builder()
                .withId(id)
                .withDataAlteracao(req.body.data_alteracao || new Date())
                .withEvent(req.body.event)
                .withDescription(req.body.description)
                .withCodIbge(req.body.cod_ibge)
                .build();

            const updatedEvento = await this.eventosService.updateEvento(id, eventoDTO);
            return res.json({ status: 'success', data: updatedEvento });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /eventos/{id}:
     *   delete:
     *     summary: Remove um evento
     *     tags: [Eventos]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID do evento
     *     responses:
     *       200:
     *         description: Evento removido com sucesso
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
     *                       example: "Evento with id 1 deleted successfully"
     *       404:
     *         description: Evento não encontrado
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
    async deleteEvento(req, res) {
        try {
            const { id } = req.params;
            const result = await this.eventosService.deleteEvento(id);
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
     * /eventos/municipio/{codIbge}:
     *   get:
     *     summary: Retorna todos os eventos de um município específico
     *     tags: [Eventos]
     *     parameters:
     *       - in: path
     *         name: codIbge
     *         schema:
     *           type: string
     *         required: true
     *         description: Código IBGE do município
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 0
     *         description: Página a ser retornada (iniciando em 0)
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Número de registros por página
     *       - in: query
     *         name: event
     *         schema:
     *           type: string
     *         description: Filtro por nome do evento
     *       - in: query
     *         name: sortDirection
     *         schema:
     *           type: string
     *           enum: [ASC, DESC]
     *           default: DESC
     *         description: Direção da ordenação por data
     *     responses:
     *       200:
     *         description: Lista de eventos do município
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
     *                     $ref: '#/components/schemas/Eventos'
     *                 pagination:
     *                   $ref: '#/components/schemas/Pagination'
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async getEventosByCodIbge(req, res) {
        try {
            const { codIbge } = req.params;
            const { page, limit, event, sortDirection } = req.query;
            const eventos = await this.eventosService.findByCodIbge(codIbge, {
                page: parseInt(page) || 0,
                limit: parseInt(limit) || 10,
                event,
                sortDirection: sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
            });
            return res.json({ 
                status: 'success', 
                data: eventos.data,
                pagination: eventos.pagination
            });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /eventos/municipios/search:
     *   get:
     *     summary: Busca municípios por nome para autocomplete
     *     tags: [Eventos]
     *     parameters:
     *       - in: query
     *         name: q
     *         schema:
     *           type: string
     *         required: true
     *         description: Termo de busca para nome do município
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Número máximo de resultados
     *     responses:
     *       200:
     *         description: Lista de municípios encontrados
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
     *                     type: object
     *                     properties:
     *                       codIbge:
     *                         type: string
     *                       nome:
     *                         type: string
     *                       status:
     *                         type: string
     *                       badges:
     *                         type: integer
     *                       points:
     *                         type: integer
     *                       imagemAvatar:
     *                         type: string
     *       500:
     *         description: Erro no servidor
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async searchMunicipios(req, res) {
        try {
            const { q, limit } = req.query;
            
            if (!q || q.length < 2) {
                return res.json({ status: 'success', data: [] });
            }
            
            const municipios = await this.municipioService.searchByName(q, parseInt(limit) || 10);
            return res.json({ status: 'success', data: municipios });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
}

module.exports = EventosController; 