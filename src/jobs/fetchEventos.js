const fetch = require('node-fetch');
const EventosRepository = require('../repository/EventosRepository');
const { EventosDTO } = require('../dto/EventosDTO');

/**
 * Fetches the latest events from external API based on the most recent data_alteracao
 * @param {Object} connection - Database connection
 * @param {String} url - URL to fetch events from
 */
async function fetchEventos(connection, url) {
    console.log('Starting job: fetchEventos');
    const eventosRepository = new EventosRepository(connection);
    
    try {
        // Find all events and get the most recent data_alteracao
        const eventos = await eventosRepository.findAll();
        let latestDate = new Date(0); // Default to epoch if no events exist
        console.log({latestDate})
        
        if (eventos.length > 0) {
            // Find the latest data_alteracao date
            eventos.forEach(evento => {
                const eventDate = new Date(evento.data_alteracao);
                if (eventDate > latestDate) {
                    latestDate = eventDate;
                }
            });
        }
        
        // Format date as ISO string for the API request
        const dateParam = latestDate.toISOString();
        console.log(`Fetching events newer than: ${dateParam}`);
        
        // Make the API request with the date parameter
        const fetchUrl = `${url}?request=eventos&date=${encodeURIComponent(dateParam)}`;
        console.log(`Fetching from URL: ${fetchUrl}`);
        
        const response = await fetch(fetchUrl);
        const newEventsData = await response.json();
        const newEvents = newEventsData.data;

        console.log({newEvents, test: newEvents.data})
        
        if (Array.isArray(newEvents) && newEvents.length > 0) {
            console.log(`Received ${newEvents.length} new events to process`);
            
            // Process and save each new event
            for (const eventData of newEvents) {
                try {
                    // Check if the event already exists in the database
                    const queryBuilder = eventosRepository.repository.createQueryBuilder("eventos")
                        .where("eventos.event = :event", { event: eventData.event })
                        .andWhere("eventos.cod_ibge = :codIbge", { codIbge: eventData.cod_ibge });
                    
                    const existingEvent = await queryBuilder.getOne();
                    
                    if (existingEvent) {
                        console.log(`Event already exists: ${eventData.event} for municipality ${eventData.cod_ibge}`);
                        continue; // Skip this event and move to the next one
                    }

                    
                    // Create a DTO from the received data
                    const eventoDTO = EventosDTO.builder()
                        .withDataAlteracao(eventData.data_alteracao || new Date())
                        .withEvent(eventData.event)
                        .withDescription(eventData.description)
                        .withCodIbge(eventData.cod_ibge)
                        .build();
                    console.log({eventoDTO: eventoDTO.toEntity()})

                    // Save the event to the database
                    await eventosRepository.create(eventoDTO.toEntity());
                    console.log(`Saved new event: ${eventData.event} for municipality ${eventData.cod_ibge}`);
                } catch (eventError) {
                    console.error(`Error processing event:`, eventError.message);
                }
            }
            
            console.log(`Successfully processed ${newEvents.length} events`);
        } else {
            console.log('No new events to process');
        }
    } catch (error) {
        console.error('Error in fetchEventos job:', error.message);
    }
    
    console.log('Finished job: fetchEventos');
}

module.exports = fetchEventos; 