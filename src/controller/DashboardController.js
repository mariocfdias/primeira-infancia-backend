const DashboardService = require('../service/DashboardService');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Endpoints para visualização de dados do dashboard
 */
class DashboardController {
    constructor(connection) {
        this.dashboardService = new DashboardService(connection);
    }

    /**
     * @swagger
     * /dashboard/mission-panorama:
     *   get:
     *     summary: Retorna um panorama geral de todas as missões com contagem de status
     *     tags: [Dashboard]
     *     parameters:
     *       - in: query
     *         name: orgao
     *         schema:
     *           type: string
     *           enum: [PREFEITURA, CAMARA]
     *         description: Filtra resultados por tipo de órgão
     *     responses:
     *       200:
     *         description: Panorama geral de missões
     */
    async getMissionPanorama(req, res) {
        try {
            const { orgao } = req.query;
            const panorama = await this.dashboardService.getMissionPanoramaGeneral(orgao);
            return res.json({ status: 'success', data: panorama });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /dashboard/mission-panorama/{missaoId}:
     *   get:
     *     summary: Retorna um panorama detalhado de uma missão específica incluindo listas de municípios
     *     tags: [Dashboard]
     *     parameters:
     *       - in: path
     *         name: missaoId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Panorama detalhado da missão
     *       404:
     *         description: Missão não encontrada
     */
    async getMissionPanoramaById(req, res) {
        try {
            const { missaoId } = req.params;
            const panorama = await this.dashboardService.getMissionPanoramaById(missaoId);
            return res.json({ status: 'success', data: panorama });
        } catch (error) {
            if (error.message === 'Missão não encontrada') {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /dashboard/map-panorama:
     *   get:
     *     summary: Retorna o panorama do mapa com distribuição de níveis
     *     tags: [Dashboard]
     *     parameters:
     *       - in: query
     *         name: orgao
     *         schema:
     *           type: string
     *           enum: [PREFEITURA, CAMARA]
     *         description: Filtra resultados por tipo de órgão
     *     responses:
     *       200:
     *         description: Panorama do mapa
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
     *                     desempenho:
     *                       type: object
     *                       properties:
     *                         levelDistribution:
     *                           type: array
     *                           items:
     *                             type: object
     *                             properties:
     *                               level:
     *                                 type: integer
     *                               minPoints:
     *                                 type: integer
     *                               maxPoints:
     *                                 type: integer
     *                               count:
     *                                 type: integer
     *                               municipios:
     *                                 type: array
     *                                 items:
     *                                   type: string
     *                         totalMunicipios:
     *                           type: integer
     *                     totalParticipatingPrefeituras:
     *                       type: integer
     *                     percentageFinishedMissions:
     *                       type: number
     *       500:
     *         description: Erro no servidor
     */
    async getMapPanorama(req, res) {
        try {
            const { orgao } = req.query;
            const data = await this.dashboardService.getMapPanorama(orgao);
            // Only return the desempenho and related data, excluding mapPanorama
            const { desempenho, totalParticipatingPrefeituras, percentageFinishedMissions } = data;
            return res.json({ 
                status: 'success', 
                data: { 
                    desempenho, 
                    totalParticipatingPrefeituras, 
                    percentageFinishedMissions 
                } 
            });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    /**
     * @swagger
     * /dashboard/map-panorama/{codIbge}:
     *   get:
     *     summary: Retorna o panorama de um município específico com contagem de status de missões e pontos
     *     tags: [Dashboard]
     *     parameters:
     *       - in: path
     *         name: codIbge
     *         required: true
     *         schema:
     *           type: string
     *         description: Código IBGE do município
     *     responses:
     *       200:
     *         description: Panorama do município específico
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
     *                     mapPanorama:
     *                       type: object
     *                       properties:
     *                         municipio:
     *                           type: object
     *                           properties:
     *                             codIbge:
     *                               type: string
     *                             nome:
     *                               type: string
     *                             status:
     *                               type: string
     *                             dataAlteracao:
     *                               type: string
     *                               format: date-time
     *                             imagemAvatar:
     *                               type: string
     *                             badges:
     *                               type: integer
     *                             points:
     *                               type: integer
     *                         countValid:
     *                           type: integer
     *                         countPending:
     *                           type: integer
     *                         countStarted:
     *                           type: integer
     *                         totalMissoes:
     *                           type: integer
     *                         points:
     *                           type: integer
     *                     level:
     *                       type: integer
     *                       description: Nível do município baseado nos pontos
     *                     totalPoints:
     *                       type: integer
     *                       description: Total de pontos do município
     *       404:
     *         description: Município não encontrado
     *       500:
     *         description: Erro no servidor
     */
    async getMapPanoramaByIbgeCode(req, res) {
        try {
            const { codIbge } = req.params;
            const data = await this.dashboardService.getMapPanoramaByIbgeCode(codIbge);
            return res.json({ status: 'success', data });
        } catch (error) {
            if (error.message === 'Município não encontrado') {
                return res.status(404).json({ status: 'error', message: error.message });
            }
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
}

module.exports = DashboardController; 